/**
 * Lambda Function: SES Bounce Handler
 * 
 * Processes bounce and complaint notifications from SES via SNS.
 * Updates DynamoDB records to mark bounced/complained emails.
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { SNSEvent } from 'aws-lambda';

// Initialize AWS clients
const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const CONTACT_TABLE_NAME = process.env.CONTACT_TABLE_NAME || 'SESCampaignContact';

/**
 * Validate table name to prevent injection attacks
 */
function validateTableName(tableName: string): boolean {
  // Only allow alphanumeric, hyphens, and underscores
  // Must start with SESCampaignContact
  return (
    /^[a-zA-Z0-9_-]+$/.test(tableName) &&
    tableName.startsWith('SESCampaignContact') &&
    tableName.length < 256 // DynamoDB table name limit
  );
}

interface SESBounceNotification {
  notificationType: 'Bounce' | 'Complaint' | 'Delivery';
  bounce?: {
    bounceType: 'Permanent' | 'Transient' | 'Undetermined';
    bounceSubType: string;
    bouncedRecipients: Array<{
      emailAddress: string;
      action?: string;
      status?: string;
      diagnosticCode?: string;
    }>;
    timestamp: string;
  };
  complaint?: {
    complainedRecipients: Array<{
      emailAddress: string;
    }>;
    timestamp: string;
    complaintFeedbackType?: string;
  };
  mail: {
    timestamp: string;
    messageId: string;
    source: string;
    destination: string[];
    tags?: {
      [key: string]: string[];
    };
  };
}

/**
 * Mark contact as bounced (permanent failure)
 */
async function markContactAsBounced(
  tableName: string,
  email: string, 
  bounceType: string, 
  bounceSubType: string,
  diagnosticCode?: string
): Promise<void> {
  const errorMessage = `PERMANENT_FAILURE: ${bounceType} - ${bounceSubType}${diagnosticCode ? ` - ${diagnosticCode}` : ''}`;
  
  try {
    await dynamoClient.send(
      new UpdateCommand({
        TableName: tableName,
        Key: { id: email },
        UpdateExpression: 'SET Sent_Status = :sent, Error_Status = :error',
        ConditionExpression: 'attribute_exists(id)', // Only update existing records
        ExpressionAttributeValues: {
          ':sent': 'true', // Mark as sent to prevent retries
          ':error': errorMessage,
        },
      })
    );
    
    console.log(`✅ Marked ${email} as bounced in table ${tableName}`);
  } catch (error) {
    // Log error but don't throw - allow other bounces to process
    if ((error as any).name === 'ConditionalCheckFailedException') {
      console.warn(`⚠️  Contact ${email} not found in table ${tableName}, skipping bounce update`);
    } else {
      console.error(`❌ Failed to mark ${email} as bounced in table ${tableName}:`, error);
    }
  }
}

/**
 * Mark contact with temporary bounce (will retry)
 */
async function markContactWithTemporaryBounce(
  tableName: string,
  email: string,
  bounceType: string,
  bounceSubType: string
): Promise<void> {
  const errorMessage = `Temporary bounce: ${bounceType} - ${bounceSubType}`;
  
  try {
    await dynamoClient.send(
      new UpdateCommand({
        TableName: tableName,
        Key: { id: email },
        UpdateExpression: 'SET Error_Status = :error',
        ConditionExpression: 'attribute_exists(id)', // Only update existing records
        ExpressionAttributeValues: {
          ':error': errorMessage,
        },
      })
    );
    
    console.log(`✅ Marked ${email} with temporary bounce in table ${tableName}`);
  } catch (error) {
    if ((error as any).name === 'ConditionalCheckFailedException') {
      console.warn(`⚠️  Contact ${email} not found in table ${tableName}, skipping bounce update`);
    } else {
      console.error(`❌ Failed to mark ${email} with temporary bounce in table ${tableName}:`, error);
    }
  }
}

/**
 * Mark contact as complained (spam report)
 */
async function markContactAsComplained(tableName: string, email: string, complaintType?: string): Promise<void> {
  const errorMessage = `PERMANENT_FAILURE: Complaint${complaintType ? ` - ${complaintType}` : ''}`;
  
  try {
    await dynamoClient.send(
      new UpdateCommand({
        TableName: tableName,
        Key: { id: email },
        UpdateExpression: 'SET Sent_Status = :sent, Error_Status = :error',
        ConditionExpression: 'attribute_exists(id)', // Only update existing records
        ExpressionAttributeValues: {
          ':sent': 'true', // Mark as sent to prevent retries
          ':error': errorMessage,
        },
      })
    );
    
    console.log(`✅ Marked ${email} as complained in table ${tableName}`);
  } catch (error) {
    if ((error as any).name === 'ConditionalCheckFailedException') {
      console.warn(`⚠️  Contact ${email} not found in table ${tableName}, skipping complaint update`);
    } else {
      console.error(`❌ Failed to mark ${email} as complained in table ${tableName}:`, error);
    }
  }
}

/**
 * Process bounce notification
 */
async function processBounce(notification: SESBounceNotification): Promise<void> {
  const bounce = notification.bounce;
  if (!bounce) return;
  
  // Extract and validate table name from email tags
  const rawTableName = notification.mail.tags?.['campaign-table']?.[0];
  const tableName = rawTableName && validateTableName(rawTableName)
    ? rawTableName
    : CONTACT_TABLE_NAME;
  
  if (rawTableName && !validateTableName(rawTableName)) {
    console.warn(`⚠️  Invalid table name from tags: "${rawTableName}", using fallback: ${CONTACT_TABLE_NAME}`);
  }
  
  console.log(`Processing ${bounce.bounceType} bounce with ${bounce.bouncedRecipients.length} recipients for table: ${tableName}`);
  
  for (const recipient of bounce.bouncedRecipients) {
    const email = recipient.emailAddress;
    
    if (bounce.bounceType === 'Permanent') {
      // Hard bounce - don't retry
      await markContactAsBounced(
        tableName,
        email,
        bounce.bounceType,
        bounce.bounceSubType,
        recipient.diagnosticCode
      );
    } else if (bounce.bounceType === 'Transient') {
      // Soft bounce - will retry
      await markContactWithTemporaryBounce(
        tableName,
        email,
        bounce.bounceType,
        bounce.bounceSubType
      );
    }
  }
}

/**
 * Process complaint notification
 */
async function processComplaint(notification: SESBounceNotification): Promise<void> {
  const complaint = notification.complaint;
  if (!complaint) return;
  
  // Extract and validate table name from email tags
  const rawTableName = notification.mail.tags?.['campaign-table']?.[0];
  const tableName = rawTableName && validateTableName(rawTableName)
    ? rawTableName
    : CONTACT_TABLE_NAME;
  
  if (rawTableName && !validateTableName(rawTableName)) {
    console.warn(`⚠️  Invalid table name from tags: "${rawTableName}", using fallback: ${CONTACT_TABLE_NAME}`);
  }
  
  console.log(`Processing complaint with ${complaint.complainedRecipients.length} recipients for table: ${tableName}`);
  
  for (const recipient of complaint.complainedRecipients) {
    await markContactAsComplained(
      tableName,
      recipient.emailAddress,
      complaint.complaintFeedbackType
    );
  }
}

/**
 * Lambda handler for SNS events
 */
export const handler = async (event: SNSEvent): Promise<void> => {
  console.log('Received SNS event:', JSON.stringify(event, null, 2));
  
  for (const record of event.Records) {
    try {
      const message = JSON.parse(record.Sns.Message) as SESBounceNotification;
      
      console.log(`Processing notification type: ${message.notificationType}`);
      
      switch (message.notificationType) {
        case 'Bounce':
          await processBounce(message);
          break;
        case 'Complaint':
          await processComplaint(message);
          break;
        case 'Delivery':
          console.log('Delivery notification received (no action needed)');
          break;
        default:
          console.warn(`Unknown notification type: ${message.notificationType}`);
      }
    } catch (error) {
      console.error('Error processing SNS record:', error);
      console.error('Record:', JSON.stringify(record, null, 2));
      // Don't throw - process other records
    }
  }
  
  console.log('Finished processing SNS event');
};

