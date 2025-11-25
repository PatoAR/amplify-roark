# EventBridge Schedule Setup for Session Cleanup Lambda

## Issue

The `schedule` property is not supported on `defineFunction` in AWS Amplify Gen 2 v1.16.1. The EventBridge trigger needs to be configured manually.

## Current Status

- ✅ Lambda function is deployed: `sessioncleanuplambda`
- ❌ EventBridge trigger is not configured (missing from AWS Console)

## Solution: Manual EventBridge Rule Creation

Since Amplify Gen 2 doesn't support schedules directly on function definitions, we need to create the EventBridge rule manually or wait for Amplify to add support.

### Option 1: Manual Setup via AWS Console (Quick Fix)

1. **Go to AWS EventBridge Console:**
   - Navigate to **EventBridge** → **Rules**

2. **Create New Rule:**
   - Click **Create rule**
   - **Name:** `session-cleanup-schedule`
   - **Event bus:** `default`
   - **Rule type:** Schedule

3. **Configure Schedule:**
   - **Schedule pattern:** Recurring schedule
   - **Schedule expression:** `rate(1 hour)`

4. **Add Target:**
   - **Target:** AWS service
   - **Select a target:** Lambda function
   - **Function:** `sessioncleanuplambda` (or the full function name)

5. **Configure Input:**
   - **Configure target input:** Optional JSON input
   - You can leave it empty or use:
     ```json
     {}
     ```

6. **Create the rule**

### Option 2: Manual Setup via AWS CLI

```bash
# Get your Lambda function ARN
FUNCTION_ARN=$(aws lambda get-function --function-name sessioncleanuplambda --query 'Configuration.FunctionArn' --output text)

# Create EventBridge rule
aws events put-rule \
  --name session-cleanup-schedule \
  --schedule-expression "rate(1 hour)" \
  --state ENABLED

# Add Lambda permission for EventBridge to invoke
aws lambda add-permission \
  --function-name sessioncleanuplambda \
  --statement-id eventbridge-invoke \
  --action lambda:InvokeFunction \
  --principal events.amazonaws.com \
  --source-arn "arn:aws:events:REGION:ACCOUNT_ID:rule/session-cleanup-schedule"

# Add Lambda as target
aws events put-targets \
  --rule session-cleanup-schedule \
  --targets "Id=1,Arn=$FUNCTION_ARN"
```

**Replace:**
- `REGION` with your AWS region (e.g., `us-east-1`)
- `ACCOUNT_ID` with your AWS account ID

### Option 3: Custom CDK Construct (Future-Proof Solution)

You can create a custom resource file to add the EventBridge schedule using CDK directly. However, this requires more setup and may conflict with Amplify's managed infrastructure.

## Verify Setup

After creating the EventBridge rule:

1. **Check Lambda Console:**
   - Go to Lambda → `sessioncleanuplambda` → Configuration → Triggers
   - Should show EventBridge (CloudWatch Events) trigger

2. **Check CloudWatch Logs:**
   - Wait up to 1 hour or test manually
   - Check `/aws/lambda/sessioncleanuplambda` log group
   - Should see "Session cleanup triggered" messages

3. **Manual Test:**
   - Lambda Console → Test → Create test event
   - Use EventBridge scheduled event format
   - Verify function executes successfully

## Note

When Amplify Gen 2 adds support for schedules in `defineFunction`, we can update the configuration to use the native approach. For now, manual setup is required.

