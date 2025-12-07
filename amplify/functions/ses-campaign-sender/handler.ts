import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, UpdateCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { SESClient, SendRawEmailCommand } from '@aws-sdk/client-ses';
import { EventBridgeEvent } from 'aws-lambda';
import { buildEmailContent } from './emailTranslations';

// Type declaration for process.env
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      AWS_REGION?: string;
      SENDER_EMAIL?: string;
      DAILY_SEND_LIMIT?: string;
      CONTACT_TABLE_NAME?: string;
      CAMPAIGN_CONTROL_TABLE_NAME?: string;
      CONTACT_TABLE_GSI_NAME?: string;
    }
  }
}

// Initialize AWS clients
const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const sesClient = new SESClient({});

// Environment variables
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'info@perkinsintel.com';
const DAILY_SEND_LIMIT = parseInt(process.env.DAILY_SEND_LIMIT || '50', 10);
const CONTACT_TABLE_NAME = process.env.CONTACT_TABLE_NAME || 'SESCampaignContact';
const CAMPAIGN_CONTROL_TABLE_NAME = process.env.CAMPAIGN_CONTROL_TABLE_NAME || 'SESCampaignControl';
// Amplify Gen 2 GSI naming convention: {modelName}sBy{FieldName}
const CONTACT_TABLE_GSI_NAME = process.env.CONTACT_TABLE_GSI_NAME || 'sESCampaignContactsBySent_Status';


interface Contact {
  email: string;
  FirstName: string;
  LastName: string;
  Company: string;
  Language?: string; // Preferred language: 'es', 'en', or 'pt' (defaults to 'es')
  Sent_Status: string; // 'true' or 'false' (stored as string for indexing)
  Target_Send_Date: string;
  Send_Group_ID: number;
  Sent_Date?: string;
  Error_Status?: string;
  Company_Sequence?: number;
}

interface CampaignControl {
  id: string; // Primary key - stores 'main'
  control: string;
  isEnabled: boolean;
  lastUpdated: string;
  updatedBy?: string;
}

/**
 * Check if campaign is enabled
 */
async function isCampaignEnabled(): Promise<boolean> {
  try {
    const result = await dynamoClient.send(
      new GetCommand({
        TableName: CAMPAIGN_CONTROL_TABLE_NAME,
        Key: { id: 'main' }, // Use 'id' as primary key, store 'main' as the id value
      })
    );

    if (!result.Item) {
      console.log('Campaign control item not found, defaulting to enabled');
      return true; // Default to enabled if control item doesn't exist
    }

    const control = result.Item as CampaignControl;
    return control.isEnabled === true;
  } catch (error) {
    console.error('Error checking campaign status:', error);
    // On error, default to enabled to avoid blocking sends
    return true;
  }
}

/**
 * Check if current time is within business hours (10 AM - 4 PM Buenos Aires time)
 */
function isWithinBusinessHours(): boolean {
  const now = new Date();
  const buenosAiresTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }));
  const hour = buenosAiresTime.getHours();
  return hour >= 10 && hour <= 16; // 10 AM to 4 PM (16:00)
}

/**
 * Get today's date in YYYY-MM-DD format (Buenos Aires timezone)
 */
function getTodayDate(): string {
  const now = new Date();
  const buenosAiresTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }));
  const year = buenosAiresTime.getFullYear();
  const month = String(buenosAiresTime.getMonth() + 1).padStart(2, '0');
  const day = String(buenosAiresTime.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}


/**
 * Send email via SES with custom header for multi-branch support
 */
async function sendEmail(to: string, firstName: string, language: string = 'es'): Promise<void> {
  const { subject, body } = buildEmailContent(firstName, language);

  // Construct raw email with custom header for table tracking
  // Headers are reliably included in SNS bounce notifications
  const rawEmail = [
    `From: Perkins Intelligence <${SENDER_EMAIL}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `X-Campaign-Table: ${CONTACT_TABLE_NAME}`, // Custom header for multi-branch support
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=UTF-8`,
    ``,
    body,
  ].join('\r\n');

  await sesClient.send(
    new SendRawEmailCommand({
      RawMessage: {
        Data: Buffer.from(rawEmail),
      },
    })
  );
}

/**
 * Query contacts ready to send
 */
async function getContactsReadyToSend(): Promise<Contact[]> {
  const today = getTodayDate();
  
  // Query GSI by Sent_Status = false, then filter by Target_Send_Date <= today
  // This is more efficient than scanning the entire table
  const result = await dynamoClient.send(
    new QueryCommand({
      TableName: CONTACT_TABLE_NAME,
      IndexName: CONTACT_TABLE_GSI_NAME, // GSI on Sent_Status
      KeyConditionExpression: 'Sent_Status = :status',
      FilterExpression: 'Target_Send_Date <= :today',
      ExpressionAttributeValues: {
        ':status': 'false', // Sent_Status stored as string
        ':today': today,
      },
    })
  );

  // Sort by Send_Group_ID ascending (already filtered by Sent_Status='false' via query)
  const contacts = (result.Items || []) as Contact[];
  contacts.sort((a, b) => (a.Send_Group_ID || 0) - (b.Send_Group_ID || 0));
  
  // Limit to daily send limit
  return contacts.slice(0, DAILY_SEND_LIMIT);
}

/**
 * Update contact after successful send
 */
async function markContactAsSent(email: string): Promise<void> {
  const today = getTodayDate();
  
  await dynamoClient.send(
    new UpdateCommand({
      TableName: CONTACT_TABLE_NAME,
      Key: { id: email }, // Use 'id' as primary key, store email as the id value
      UpdateExpression: 'SET Sent_Status = :sent, Sent_Date = :date REMOVE Error_Status',
      ExpressionAttributeValues: {
        ':sent': 'true', // Sent_Status stored as string
        ':date': today,
      },
    })
  );
}

/**
 * Check if an error represents a permanent failure (should not retry)
 * Permanent failures include: invalid email addresses, non-existent domains, etc.
 */
function isPermanentFailure(error: unknown): boolean {
  if (!error) return false;
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorName = (error as any)?.name || '';
  
  // Convert to lowercase for case-insensitive matching
  const messageLower = errorMessage.toLowerCase();
  const nameLower = errorName.toLowerCase();
  
  // AWS SES permanent failure indicators
  const permanentFailureIndicators = [
    'message rejected',
    'invalid email address',
    'invalidparameter',
    'invalid email',
    'email address not verified',
    'does not exist',
    'mailbox does not exist',
    'domain does not exist',
    'invalid destination',
    'suppression list',
    'hard bounce',
    'mailboxfull', // Some providers treat this as permanent
    'user unknown',
    'no such user',
    'recipient address rejected',
    'address rejected',
  ];
  
  // Check error name (e.g., "MessageRejected", "InvalidParameterValue")
  if (nameLower.includes('message rejected') || 
      nameLower.includes('invalid') ||
      nameLower.includes('rejected')) {
    return true;
  }
  
  // Check error message for permanent failure indicators
  return permanentFailureIndicators.some(indicator => 
    messageLower.includes(indicator)
  );
}

/**
 * Mark contact with error status (temporary failure - will retry)
 */
async function markContactWithError(email: string, errorMessage: string): Promise<void> {
  await dynamoClient.send(
    new UpdateCommand({
      TableName: CONTACT_TABLE_NAME,
      Key: { id: email }, // Use 'id' as primary key, store email as the id value
      UpdateExpression: 'SET Error_Status = :error',
      ExpressionAttributeValues: {
        ':error': errorMessage,
      },
    })
  );
}

/**
 * Mark contact as permanently failed (will not retry)
 * Sets Sent_Status to 'true' to exclude from future retry attempts
 */
async function markContactAsPermanentlyFailed(email: string, errorMessage: string): Promise<void> {
  const today = getTodayDate();
  
  await dynamoClient.send(
    new UpdateCommand({
      TableName: CONTACT_TABLE_NAME,
      Key: { id: email }, // Use 'id' as primary key, store email as the id value
      UpdateExpression: 'SET Sent_Status = :sent, Error_Status = :error, Sent_Date = :date',
      ExpressionAttributeValues: {
        ':sent': 'true', // Mark as 'sent' to prevent retries
        ':error': `PERMANENT_FAILURE: ${errorMessage}`,
        ':date': today,
      },
    })
  );
}

/**
 * Process scheduled campaign
 */
async function processCampaign(): Promise<{ success: boolean; sent: number; errors: number; message: string }> {
  console.log('Starting campaign processing:', new Date().toISOString());

  // Check campaign status
  const isEnabled = await isCampaignEnabled();
  if (!isEnabled) {
    console.log('Campaign is disabled, skipping execution');
    return {
      success: true,
      sent: 0,
      errors: 0,
      message: 'Campaign is disabled',
    };
  }

  // Check timezone
  if (!isWithinBusinessHours()) {
    console.log('Outside business hours (10 AM - 4 PM Buenos Aires time), skipping');
    return {
      success: true,
      sent: 0,
      errors: 0,
      message: 'Outside business hours',
    };
  }

  // Get contacts ready to send
  const contacts = await getContactsReadyToSend();
  console.log(`Found ${contacts.length} contacts ready to send`);

  if (contacts.length === 0) {
    return {
      success: true,
      sent: 0,
      errors: 0,
      message: 'No contacts ready to send',
    };
  }

  let sentCount = 0;
  let errorCount = 0;

  // Process each contact
  for (const contact of contacts) {
    try {
      const language = contact.Language || 'es'; // Default to Spanish if not specified
      console.log(`Sending email to ${contact.email} (${contact.FirstName}) in ${language}`);
      await sendEmail(contact.email, contact.FirstName, language);
      await markContactAsSent(contact.email);
      sentCount++;
      console.log(`Successfully sent email to ${contact.email}`);
    } catch (error) {
      errorCount++;
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error sending email to ${contact.email}:`, errorMessage);
      
      // Check if this is a permanent failure (invalid email, etc.)
      if (isPermanentFailure(error)) {
        console.log(`Permanent failure detected for ${contact.email}, marking as permanently failed (will not retry)`);
        await markContactAsPermanentlyFailed(contact.email, errorMessage);
      } else {
        // Temporary failure - will retry in future runs
        await markContactWithError(contact.email, errorMessage);
      }
    }
  }

  return {
    success: true,
    sent: sentCount,
    errors: errorCount,
    message: `Processed ${contacts.length} contacts: ${sentCount} sent, ${errorCount} errors`,
  };
}

/**
 * Handle test email request
 */
async function handleTestEmail(testEmail: string, firstName: string, language: string = 'es'): Promise<{ success: boolean; message: string }> {
  try {
    // Validate and normalize language
    const supportedLanguages = ['es', 'en', 'pt'];
    const normalizedLanguage = supportedLanguages.includes(language.toLowerCase()) 
      ? language.toLowerCase() 
      : 'es';
    
    console.log(`Sending test email to ${testEmail} with firstName: ${firstName} in language: ${normalizedLanguage}`);
    await sendEmail(testEmail, firstName, normalizedLanguage);
    return {
      success: true,
      message: `Test email sent successfully to ${testEmail}`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error sending test email:`, errorMessage);
    return {
      success: false,
      message: `Failed to send test email: ${errorMessage}`,
    };
  }
}

/**
 * Lambda handler - handles both EventBridge events and HTTP requests
 */
export const handler = async (
  event: EventBridgeEvent<'Scheduled Event', {}> | any
): Promise<any> => {
  // Check if this is an HTTP request (Function URL)
  if (event.requestContext || event.httpMethod || event.body) {
    // Handle HTTP request (test email endpoint)
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Content-Type': 'application/json',
    };

    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS' || (event.requestContext?.http?.method === 'OPTIONS')) {
      return {
        statusCode: 200,
        headers,
        body: '',
      };
    }

    try {
      const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
      const { testEmail, firstName, language } = body;

      if (!testEmail || !firstName) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'Missing required fields: testEmail and firstName',
          }),
        };
      }

      const result = await handleTestEmail(testEmail, firstName, language);
      
      return {
        statusCode: result.success ? 200 : 500,
        headers,
        body: JSON.stringify(result),
      };
    } catch (error) {
      console.error('Error handling test email request:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          message: error instanceof Error ? error.message : 'Internal server error',
        }),
      };
    }
  }

  // Handle EventBridge scheduled event
  try {
    const result = await processCampaign();
    return result;
  } catch (error) {
    console.error('Error processing campaign:', error);
    return {
      success: false,
      sent: 0,
      errors: 0,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

