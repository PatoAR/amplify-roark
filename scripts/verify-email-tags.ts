/**
 * Script to verify email tags are working correctly
 * 
 * This script checks CloudWatch logs to see if the campaign-table tag
 * is present in SNS bounce notifications.
 */

import { CloudWatchLogsClient, FilterLogEventsCommand } from '@aws-sdk/client-cloudwatch-logs';

// Update this with your actual Lambda function name
// Find it with: aws lambda list-functions --query "Functions[?contains(FunctionName, 'bounce')].FunctionName"
const LOG_GROUP_NAME = '/aws/lambda/amplify-d3cia60j16f4j7-de-sesbouncehandlerlambda83-iyceC9J2SHNq';

async function verifyEmailTags() {
  const client = new CloudWatchLogsClient({});
  
  console.log('🔍 Checking CloudWatch logs for email tags...\n');
  
  // Get logs from the last 60 minutes
  const startTime = Date.now() - 60 * 60 * 1000;
  
  try {
    const command = new FilterLogEventsCommand({
      logGroupName: LOG_GROUP_NAME,
      startTime,
      filterPattern: 'Received SNS event',
      limit: 1,
    });
    
    const response = await client.send(command);
    
    if (!response.events || response.events.length === 0) {
      console.log('⚠️  No recent SNS events found in logs.');
      console.log('   Try sending a test bounce email first:');
      console.log('   npm run test-bounce bounce@simulator.amazonses.com <function-url>\n');
      return;
    }
    
    const logEvent = response.events[0];
    const logMessage = logEvent.message || '';
    
    // Try to extract the SNS message JSON
    const messageMatch = logMessage.match(/"Message":\s*"({[^"]+})"/);
    
    if (!messageMatch) {
      console.log('⚠️  Could not parse SNS message from logs.');
      console.log('   Raw log message:');
      console.log(logMessage.substring(0, 500) + '...\n');
      return;
    }
    
    // Unescape the JSON string
    const jsonString = messageMatch[1]
      .replace(/\\"/g, '"')
      .replace(/\\n/g, '\n')
      .replace(/\\\\/g, '\\');
    
    try {
      const sesNotification = JSON.parse(jsonString);
      
      console.log('✅ Found SNS bounce notification\n');
      
      // Check if tags are present in the mail object
      const mail = sesNotification.mail || {};
      const tags = mail.tags || {};
      const campaignTableTag = tags['campaign-table'];
      
      console.log('📧 Email Details:');
      console.log(`   From: ${mail.source || 'N/A'}`);
      console.log(`   To: ${mail.destination?.[0] || 'N/A'}`);
      console.log(`   Message ID: ${mail.messageId || 'N/A'}\n`);
      
      console.log('🏷️  Email Tags:');
      if (campaignTableTag) {
        console.log(`   ✅ campaign-table tag found: ${campaignTableTag[0] || campaignTableTag}`);
        console.log(`   ✅ Multi-branch support is WORKING\n`);
        
        // Verify the tag value matches expected format
        const tableName = campaignTableTag[0] || campaignTableTag;
        if (tableName.startsWith('SESCampaignContact')) {
          console.log(`   ✅ Tag format is correct (starts with SESCampaignContact)`);
        } else {
          console.log(`   ⚠️  Tag format unexpected: ${tableName}`);
        }
      } else {
        console.log('   ⚠️  campaign-table tag NOT found');
        console.log('   ⚠️  Bounce handler will use fallback table name');
        console.log('   ⚠️  Multi-branch support may not work correctly\n');
        
        console.log('   Available tags in mail object:');
        if (Object.keys(tags).length > 0) {
          console.log(`   ${JSON.stringify(tags, null, 2)}`);
        } else {
          console.log('   (no tags found)');
        }
        console.log('');
        
        console.log('   🔧 Troubleshooting:');
        console.log('   1. Check that ses-campaign-sender includes Tags in SendEmailCommand');
        console.log('   2. Verify the email was sent AFTER deploying the tag changes');
        console.log('   3. Check that CONTACT_TABLE_NAME is set correctly in campaign sender\n');
      }
      
      // Show bounce details
      const bounce = sesNotification.bounce;
      if (bounce) {
        console.log('📬 Bounce Details:');
        console.log(`   Type: ${bounce.bounceType}`);
        console.log(`   Subtype: ${bounce.bounceSubType}`);
        console.log(`   Recipients: ${bounce.bouncedRecipients?.length || 0}\n`);
      }
      
    } catch (parseError) {
      console.error('❌ Error parsing SNS message JSON:', parseError);
      console.log('\n   Raw JSON string (first 500 chars):');
      console.log(jsonString.substring(0, 500));
    }
    
  } catch (error) {
    console.error('❌ Error reading CloudWatch logs:', error);
    console.log('\n   Make sure:');
    console.log('   1. AWS credentials are configured');
    console.log('   2. You have CloudWatch Logs read permissions');
    console.log('   3. The Lambda function has been invoked at least once');
  }
}

verifyEmailTags();

