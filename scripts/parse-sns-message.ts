/**
 * Quick script to parse the SNS message from CloudWatch logs
 * and check for email tags
 */

const snsMessage = `{"notificationType":"Bounce","bounce":{"feedbackId":"0100019af0df7efa-4ea4ed74-6eb7-45c6-bced-5eea77116c21-000000","bounceType":"Permanent","bounceSubType":"General","bouncedRecipients":[{"emailAddress":"bounce@simulator.amazonses.com","action":"failed","status":"5.1.1","diagnosticCode":"smtp; 550 5.1.1 As requested: user unknown <bounce@simulator.amazonses.com>"}],"timestamp":"2025-12-05T23:36:10.000Z","remoteMtaIp":"52.2.231.183","reportingMTA":"dns; a8-91.smtp-out.amazonses.com"},"mail":{"timestamp":"2025-12-05T23:36:09.864Z","source":"Perkins Intelligence <info@perkinsintel.com>","sourceArn":"arn:aws:ses:us-east-1:038023955765:identity/perkinsintel.com","sourceIp":"3.94.191.87","callerIdentity":"amplify-d3cia60j16f4j7-de-sescampaignsenderlambdaSe-h3Utoxl4Z87l","sendingAccountId":"038023955765","messageId":"0100019af0df7d88-660ee24d-7e0c-4068-be85-fa05de580a77-000000","destination":["bounce@simulator.amazonses.com"],"headersTruncated":false,"headers":[{"name":"From","value":"Perkins Intelligence <info@perkinsintel.com>"},{"name":"To","value":"bounce@simulator.amazonses.com"},{"name":"Subject","value":"Invitación a Perkins Intelligence"},{"name":"MIME-Version","value":"1.0"},{"name":"Content-Type","value":"text/plain; charset=UTF-8"},{"name":"Content-Transfer-Encoding","value":"quoted-printable"}],"commonHeaders":{"from":["Perkins Intelligence <info@perkinsintel.com>"],"to":["bounce@simulator.amazonses.com"],"subject":"Invitación a Perkins Intelligence"}}}`;

const notification = JSON.parse(snsMessage);

console.log('📧 Email Tags Analysis\n');
console.log('Mail object keys:', Object.keys(notification.mail));
console.log('');

if (notification.mail.tags) {
  console.log('✅ Tags found!');
  console.log(JSON.stringify(notification.mail.tags, null, 2));
  
  const campaignTableTag = notification.mail.tags['campaign-table'];
  if (campaignTableTag) {
    console.log(`\n✅ campaign-table tag: ${campaignTableTag[0] || campaignTableTag}`);
  }
} else {
  console.log('⚠️  NO TAGS FOUND in mail object');
  console.log('\nThis means:');
  console.log('1. Email was sent BEFORE tags were added to the code, OR');
  console.log('2. Tags are not being passed through SES to SNS');
  console.log('\nThe bounce handler is using the fallback table name from environment variable.');
}

console.log('\n📊 Bounce Handler Behavior:');
console.log('The handler used table: SESCampaignContact-p7l2jyarsfe5netqwh7uthfc3i-NONE');
console.log('This is correct because:');
console.log('- It matches your branch\'s table name');
console.log('- Handler fell back to CONTACT_TABLE_NAME environment variable');
console.log('- This works, but tags would be better for multi-branch support');

