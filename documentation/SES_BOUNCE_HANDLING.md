# SES Bounce and Complaint Handling

## Current State vs Full Implementation

### What's Currently Detected ✅

**Synchronous Errors** (Immediate API failures):
- Invalid email format
- Sender email not verified
- Account in sandbox mode
- Rate limits exceeded
- Invalid parameters
- SES quota exceeded

These errors are caught immediately when sending and stored in DynamoDB `Error_Status` field.

### What's NOT Currently Detected ❌

**Asynchronous Bounces** (Post-send failures):
- **Hard Bounces** (Permanent):
  - Email address doesn't exist
  - Domain doesn't exist
  - Mailbox disabled
  - Invalid recipient
  
- **Soft Bounces** (Temporary):
  - Mailbox full
  - Server temporarily unavailable
  - Message too large
  - Content rejected temporarily

- **Complaints**:
  - User marked email as spam
  - Spam filter complaints

## Why Bounces Aren't Detected Now

### The Asynchronous Nature of Email

```
Timeline of an email send:

T+0s:  Your Lambda calls SES API
       ↓
T+0s:  SES accepts email (returns success) ✅
       ↓ Your code marks it as "sent"
       ↓
T+1s:  SES forwards to recipient's mail server
       ↓
T+30s: Recipient mail server rejects email ❌
       ↓ "User not found"
       ↓
T+35s: SES receives bounce notification
       ↓
T+36s: SES publishes to SNS topic 📢
       ↓
T+36s: Your bounce handler Lambda (NOT IMPLEMENTED)
       ↓
       ❌ Never updates DynamoDB
```

**Key Point**: When `SendEmailCommand` returns success, it only means "SES accepted the email for delivery", not "email was delivered".

## Impact on Your Analytics

### Current Dashboard Shows:

```typescript
contactsSent: 100        // ← Includes emails that bounced!
contactsWithErrors: 5    // ← Only immediate API errors
successRate: 95%         // ← MISLEADING - doesn't include bounces
```

### Actual Reality Might Be:

```
100 emails "sent" by Lambda
  - 5 failed immediately (caught) ❌
  - 95 accepted by SES ✅
    - 80 actually delivered ✅
    - 15 bounced later ❌ (NOT TRACKED)

Real success rate: 80% (not 95%!)
```

## How to Implement Full Bounce Handling

### Architecture Overview

```
┌─────────────────┐
│  SES Campaign   │
│  Sender Lambda  │
└────────┬────────┘
         │
         │ SendEmail
         ▼
    ┌─────────┐
    │   SES   │
    └────┬────┘
         │
         │ (later: bounce/complaint)
         ▼
    ┌─────────┐
    │   SNS   │
    │  Topic  │
    └────┬────┘
         │
         │ notification
         ▼
┌─────────────────┐
│ Bounce Handler  │
│     Lambda      │
└────────┬────────┘
         │
         │ update Error_Status
         ▼
    ┌──────────┐
    │ DynamoDB │
    └──────────┘
```

### Implementation Steps

#### 1. Create SNS Topics

```bash
# In AWS SNS Console, create two topics:
# - ses-bounces
# - ses-complaints
```

#### 2. Configure SES to Publish to SNS

```bash
# AWS SES Console → Verified identities → info@perkinsintel.com
# → Notifications → Edit

# Configure:
# - Bounces → ses-bounces SNS topic
# - Complaints → ses-complaints SNS topic
```

#### 3. Add Bounce Handler to Backend

**File**: `amplify/backend.ts`

```typescript
import { sesBounceHandler } from './functions/ses-bounce-handler/resource';

export const backend = defineBackend({
  auth,
  data,
  referralProcessor,
  subscriptionManager,
  sessionCleanup,
  sesCampaignSender,
  sesBounceHandler,  // ← Add this
});

// Configure bounce handler
const bounceHandlerFunction = backend.sesBounceHandler.resources.lambda;
const contactTable = backend.data.resources.tables['SESCampaignContact'];

// Set environment variable
bounceHandlerFunction.addEnvironment('CONTACT_TABLE_NAME', contactTable.tableName);

// Grant DynamoDB permissions
bounceHandlerFunction.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ['dynamodb:UpdateItem'],
    resources: [contactTable.tableArn],
  })
);

// Subscribe to SNS topics (manual step - see below)
```

#### 4. Subscribe Lambda to SNS Topics

**Option A: Via AWS Console** (Easiest)
1. Go to SNS Console → Topics → `ses-bounces`
2. Click "Create subscription"
3. Protocol: AWS Lambda
4. Endpoint: Select `ses-bounce-handler` Lambda
5. Repeat for `ses-complaints` topic

**Option B: Via CDK** (Automated)
```typescript
// In amplify/backend.ts
import { Topic } from 'aws-cdk-lib/aws-sns';
import { LambdaSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';

// Get or create SNS topics
const bouncesTopic = Topic.fromTopicArn(
  stack,
  'SESBounceTopic',
  'arn:aws:sns:us-east-1:YOUR_ACCOUNT:ses-bounces'
);

const complaintsTopic = Topic.fromTopicArn(
  stack,
  'SESComplaintsTopic',
  'arn:aws:sns:us-east-1:YOUR_ACCOUNT:ses-complaints'
);

// Subscribe Lambda
bouncesTopic.addSubscription(new LambdaSubscription(bounceHandlerFunction));
complaintsTopic.addSubscription(new LambdaSubscription(bounceHandlerFunction));
```

#### 5. Grant SNS Permission to Invoke Lambda

The Lambda needs permission to be invoked by SNS:

```typescript
// In amplify/backend.ts
import { ServicePrincipal } from 'aws-cdk-lib/aws-iam';

bounceHandlerFunction.grantInvoke(
  new ServicePrincipal('sns.amazonaws.com')
);
```

### Testing

#### Test Bounce Handling

Use SES simulator emails:
```typescript
// These are special addresses that trigger different scenarios
const testEmails = {
  success: 'success@simulator.amazonses.com',       // Delivers successfully
  bounce: 'bounce@simulator.amazonses.com',         // Hard bounce
  complaint: 'complaint@simulator.amazonses.com',   // Spam complaint
  softBounce: 'ooto@simulator.amazonses.com',       // Soft bounce (Out of office)
};
```

Send test emails:
```bash
# Via Function URL
curl -X POST https://your-function-url \
  -H "Content-Type: application/json" \
  -d '{"testEmail": "bounce@simulator.amazonses.com", "firstName": "Test"}'
```

Then check:
1. **CloudWatch Logs** for bounce handler Lambda
2. **DynamoDB** for updated `Error_Status` field
3. **Analytics Dashboard** for updated error metrics

## Updated Analytics Metrics

With bounce handling, your dashboard will show:

```typescript
// Before (current):
contactsSent: 100         // Accepted by SES
contactsWithErrors: 5     // Immediate API errors only

// After (with bounce handling):
contactsSent: 80          // Actually delivered
contactsWithErrors: 20    // Immediate errors + bounces + complaints
permanentFailures: 18     // Hard bounces + complaints
temporaryFailures: 2      // Soft bounces (will retry)
```

## Bounce Types Explained

### Permanent Bounces (Don't Retry)

**General** - General hard bounce
- Email address doesn't exist
- Domain doesn't exist

**NoEmail** - Mailbox doesn't exist
- User account closed
- Never existed

**Suppressed** - On SES suppression list
- Previously bounced
- Previously complained

### Transient Bounces (Will Retry)

**General** - Temporary issue
- Server temporarily unavailable

**MailboxFull** - Recipient's mailbox full
- May work later

**MessageTooLarge** - Email too big
- Retry with smaller content

**ContentRejected** - Content filtered
- May be temporary

## Best Practices

### 1. Monitor Bounce Rate

Keep bounce rate < 5%:
```typescript
const bounceRate = (permanentFailures / totalSent) * 100;
if (bounceRate > 5) {
  console.warn('High bounce rate! Clean your email list');
}
```

### 2. Remove Hard Bounces

Don't send to addresses that hard bounced:
- Mark `Sent_Status = 'true'` (already done)
- Add to suppression list

### 3. Retry Soft Bounces

Soft bounces should retry with backoff:
- Wait 1 day
- Wait 3 days
- Wait 7 days
- Then mark as permanent

### 4. Handle Complaints Seriously

Complaints hurt sender reputation:
- Never send to complained addresses again
- Review email content
- Check if following email best practices

## Cost Implications

SNS costs are minimal:
- $0.50 per 1 million requests
- For 1,320 emails: < $0.01

Lambda invocations:
- Bounce handler runs only when bounces occur
- Typical: 2-5% of sends
- For 1,320 emails: ~40 bounces × $0.0000002 = negligible

## Security Considerations

### SNS Message Validation

The bounce handler should validate SNS signatures:

```typescript
import { MessageValidator } from 'sns-validator';

const validator = new MessageValidator();

// In handler:
await validator.validate(record.Sns);
```

### DynamoDB Access

Grant minimal permissions:
```typescript
actions: ['dynamodb:UpdateItem']  // Not GetItem, Scan, etc.
resources: [contactTable.tableArn]  // Specific table only
```

## Summary

### Current Implementation
✅ Detects immediate API errors (5%)
❌ Misses asynchronous bounces (95% of failures)
❌ No complaint handling

### With Bounce Handling
✅ Detects immediate API errors
✅ Detects hard bounces (permanent failures)
✅ Detects soft bounces (retry later)
✅ Detects spam complaints
✅ Accurate success metrics
✅ Better sender reputation

### Next Steps

1. Review the provided Lambda code
2. Create SNS topics in AWS Console
3. Configure SES to publish notifications
4. Add bounce handler to `amplify/backend.ts`
5. Deploy and test with simulator emails
6. Monitor CloudWatch logs
7. Verify DynamoDB updates
8. Check Analytics Dashboard metrics

**Recommendation**: Implement bounce handling before sending to the full 1,320 contact list. This will give you accurate metrics and protect your sender reputation.

