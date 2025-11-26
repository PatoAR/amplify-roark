import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, UpdateCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { EventBridgeEvent } from 'aws-lambda';

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
const CONTACT_TABLE_GSI_NAME = process.env.CONTACT_TABLE_GSI_NAME || 'SESCampaignContactSent_StatusTarget_Send_Date';

// Email template
const EMAIL_TEMPLATE = `Asunto: Invitación anticipada: Acceso a Perkins Intelligence

Hola [Nombre del Contacto],

Te escribo porque estamos lanzando la versión profesional de **Perkins Intelligence** y he seleccionado tu perfil para darte acceso prioritario.

Hemos desarrollado una herramienta de inteligencia de mercado similar a las terminales financieras tradicionales (estilo Bloomberg), pero diseñada para ser accesible y 100% personalizable según los sectores y países que tú necesites monitorear.

¿Qué puedes hacer en Perkins?
* Filtrar el ruido mediático y recibir solo noticias críticas.
* Monitorear empresas y mercados en tiempo real.
* Tomar decisiones informadas sin pagar licencias costosas.

Ya puedes configurar tu panel de control ingresando directamente en nuestra web segura:
https://www.perkinsintel.com

Me encantaría conocer tu opinión una vez que la pruebes.

Saludos cordiales,

Perkins Intelligence`;

interface Contact {
  email: string;
  FirstName: string;
  LastName: string;
  Company: string;
  Sent_Status: boolean;
  Target_Send_Date: string;
  Send_Group_ID: number;
  Sent_Date?: string;
  Error_Status?: string;
  Company_Sequence?: number;
}

interface CampaignControl {
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
        Key: { control: 'main' },
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
 * Check if current time is within business hours (8 AM - 5 PM Buenos Aires time)
 */
function isWithinBusinessHours(): boolean {
  const now = new Date();
  const buenosAiresTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }));
  const hour = buenosAiresTime.getHours();
  return hour >= 8 && hour < 17; // 8 AM to 5 PM (17:00)
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
 * Personalize email template with contact's first name
 */
function personalizeEmail(firstName: string): string {
  return EMAIL_TEMPLATE.replace(/\[Nombre del Contacto\]/g, firstName);
}

/**
 * Send email via SES
 */
async function sendEmail(to: string, firstName: string): Promise<void> {
  const personalizedContent = personalizeEmail(firstName);
  
  // Extract subject and body from template
  const lines = personalizedContent.split('\n');
  const subjectLine = lines[0];
  const subject = subjectLine.replace('Asunto: ', '').trim();
  const body = lines.slice(2).join('\n').trim();

  await sesClient.send(
    new SendEmailCommand({
      Source: SENDER_EMAIL,
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8',
        },
        Body: {
          Text: {
            Data: body,
            Charset: 'UTF-8',
          },
        },
      },
    })
  );
}

/**
 * Query contacts ready to send
 */
async function getContactsReadyToSend(): Promise<Contact[]> {
  const today = getTodayDate();
  
  const result = await dynamoClient.send(
    new QueryCommand({
      TableName: CONTACT_TABLE_NAME,
      IndexName: CONTACT_TABLE_GSI_NAME, // Amplify-generated GSI name from environment
      KeyConditionExpression: 'Sent_Status = :status AND Target_Send_Date <= :today',
      ExpressionAttributeValues: {
        ':status': false,
        ':today': today,
      },
    })
  );

  const contacts = (result.Items || []) as Contact[];
  
  // Sort by Send_Group_ID ascending
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
      Key: { email },
      UpdateExpression: 'SET Sent_Status = :sent, Sent_Date = :date REMOVE Error_Status',
      ExpressionAttributeValues: {
        ':sent': true,
        ':date': today,
      },
    })
  );
}

/**
 * Mark contact with error status
 */
async function markContactWithError(email: string, errorMessage: string): Promise<void> {
  await dynamoClient.send(
    new UpdateCommand({
      TableName: CONTACT_TABLE_NAME,
      Key: { email },
      UpdateExpression: 'SET Error_Status = :error',
      ExpressionAttributeValues: {
        ':error': errorMessage,
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
    console.log('Outside business hours (8 AM - 5 PM Buenos Aires time), skipping');
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
      console.log(`Sending email to ${contact.email} (${contact.FirstName})`);
      await sendEmail(contact.email, contact.FirstName);
      await markContactAsSent(contact.email);
      sentCount++;
      console.log(`Successfully sent email to ${contact.email}`);
    } catch (error) {
      errorCount++;
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error sending email to ${contact.email}:`, errorMessage);
      await markContactWithError(contact.email, errorMessage);
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
async function handleTestEmail(testEmail: string, firstName: string): Promise<{ success: boolean; message: string }> {
  try {
    console.log(`Sending test email to ${testEmail} with firstName: ${firstName}`);
    await sendEmail(testEmail, firstName);
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
      const { testEmail, firstName } = body;

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

      const result = await handleTestEmail(testEmail, firstName);
      
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

