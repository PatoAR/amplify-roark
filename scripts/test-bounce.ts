/**
 * Test Bounce Handling Script
 * 
 * Creates a test contact in DynamoDB, sends a test email, then waits for bounce.
 * This allows you to test the complete bounce handling flow.
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { discoverTableName } from './utils/table-discovery';
import * as https from 'https';

// Initialize AWS clients
const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

// Get function URL from environment or prompt user
const FUNCTION_URL = process.env.FUNCTION_URL || '';

/**
 * Create test contact in DynamoDB
 */
async function createTestContact(tableName: string, email: string): Promise<void> {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  await dynamoClient.send(
    new PutCommand({
      TableName: tableName,
      Item: {
        id: email, // Primary key
        email: email,
        Company: 'Test Company',
        FirstName: 'Test',
        LastName: 'Bounce',
        Language: 'es',
        Sent_Status: 'false', // Not sent yet
        Target_Send_Date: today,
        Send_Group_ID: 999, // High number to avoid conflicts
        Company_Sequence: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    })
  );
  
  console.log(`✅ Created test contact: ${email}`);
}

/**
 * Send test email via Function URL
 */
async function sendTestEmail(functionUrl: string, email: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      testEmail: email,
      firstName: 'Test',
      language: 'es',
    });

    const url = new URL(functionUrl);
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`✅ Test email sent successfully`);
          console.log(`   Response: ${responseData}`);
          resolve();
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

/**
 * Main execution
 */
async function main() {
  try {
    const args = process.argv.slice(2);
    const email = args[0] || 'bounce@simulator.amazonses.com';
    const functionUrl = args[1] || FUNCTION_URL;

    if (!functionUrl) {
      console.error('❌ Function URL required!');
      console.log('\nUsage:');
      console.log('  npm run test-bounce [email] [function-url]');
      console.log('\nExample:');
      console.log('  npm run test-bounce bounce@simulator.amazonses.com https://abc123.lambda-url.us-east-1.on.aws/');
      process.exit(1);
    }

    console.log('🧪 Testing Bounce Handling\n');
    console.log(`Email: ${email}`);
    console.log(`Function URL: ${functionUrl}\n`);

    // Step 1: Discover table
    console.log('🔍 Discovering SESCampaignContact table...');
    const tableName = await discoverTableName(
      'SESCampaignContact',
      'CONTACT_TABLE_NAME',
      'SESCampaignContactTableName'
    );
    console.log(`✅ Found table: ${tableName}\n`);

    // Step 2: Create test contact
    console.log('📝 Creating test contact in DynamoDB...');
    await createTestContact(tableName, email);
    console.log('');

    // Step 3: Send test email
    console.log('📧 Sending test email via SES...');
    await sendTestEmail(functionUrl, email);
    console.log('');

    // Step 4: Instructions
    console.log('⏳ Waiting for bounce (1-2 minutes)...\n');
    console.log('Next steps:');
    console.log('1. Wait 1-2 minutes for SES to simulate bounce');
    console.log('2. Check CloudWatch Logs: /aws/lambda/ses-bounce-handler-dev-{hash}');
    console.log('3. Check DynamoDB: The record should have:');
    console.log('   - Sent_Status: "true"');
    console.log('   - Error_Status: "PERMANENT_FAILURE: Permanent - General"');
    console.log('4. Check Analytics Dashboard: Error metrics should update\n');

    console.log('✅ Test setup complete!');

  } catch (error) {
    console.error('❌ Error during test:', error);
    process.exit(1);
  }
}

main();

