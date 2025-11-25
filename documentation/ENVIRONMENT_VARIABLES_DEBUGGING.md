# Environment Variables Debugging Guide

## Issue: Only `AMPLIFY_SSM_ENV_CONFIG` visible in Lambda Console

### Understanding the Configuration

When using `secret()` in AWS Amplify Gen 2, environment variables are stored in **AWS Systems Manager (SSM) Parameter Store** and accessed at runtime. This is why you only see `AMPLIFY_SSM_ENV_CONFIG` in the Lambda console - this is **expected behavior**.

### How It Works

1. **Configuration**: `secret('GRAPHQL_API_URL')` stores a reference to SSM Parameter Store
2. **Deployment**: Amplify creates SSM parameters and stores the secret references
3. **Runtime**: Lambda reads `AMPLIFY_SSM_ENV_CONFIG` to know where to fetch secrets from SSM
4. **Access**: Your code uses `process.env.GRAPHQL_API_URL` normally - Amplify resolves it from SSM at runtime

### Why It's Not Working

If the function can't access the secrets at runtime, possible causes:

1. **IAM Permissions**: Lambda execution role needs SSM read permissions
2. **Secrets Not Created**: Secrets may not exist in SSM Parameter Store
3. **Wrong Secret Names**: Secret names might not match between function config and SSM

## Diagnostic Steps

### Step 1: Verify Secrets Exist in SSM

Check if the secrets are in SSM Parameter Store:

```bash
# List SSM parameters for your app
aws ssm describe-parameters \
  --parameter-filters "Key=Name,Values=/amplify/*/GRAPHQL_API_URL"

# Get the actual secret value (if you have permissions)
aws ssm get-parameter \
  --name "/amplify/<your-app-id>/GRAPHQL_API_URL" \
  --with-decryption
```

**In AWS Console:**
1. Go to **Systems Manager** → **Parameter Store**
2. Look for parameters like:
   - `/amplify/<app-id>/GRAPHQL_API_URL`
   - `/amplify/<app-id>/GRAPHQL_API_KEY`

### Step 2: Check Lambda Execution Role Permissions

The Lambda execution role needs permission to read from SSM:

**Required IAM Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ssm:GetParameter",
        "ssm:GetParameters",
        "ssm:GetParametersByPath"
      ],
      "Resource": "arn:aws:ssm:*:*:parameter/amplify/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "kms:Decrypt"
      ],
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "kms:ViaService": "ssm.*.amazonaws.com"
        }
      }
    }
  ]
}
```

**To Check:**
1. Lambda Console → Function → **Configuration** → **Permissions**
2. Click on the **Execution role**
3. Verify it has SSM read permissions (Amplify should add these automatically)

### Step 3: Compare with Working Functions

Check how working functions are configured:

1. **In Lambda Console:**
   - Compare `sessioncleanuplambda` with `referralProcessor` or `postConfirmation`
   - Both should only show `AMPLIFY_SSM_ENV_CONFIG`
   - Check their execution roles are similar

2. **In Code:**
   - `referralProcessor` uses: `secret('GRAPHQL_API_URL')`
   - `sessionCleanup` uses: `secret('GRAPHQL_API_URL')`
   - They should be identical

### Step 4: Check CloudWatch Logs

When the function runs, check logs for SSM access errors:

```
AccessDeniedException: User: arn:aws:sts::...:assumed-role/.../session-cleanup is not authorized to perform: ssm:GetParameter
```

This indicates IAM permission issues.

### Step 5: Test Secret Access at Runtime

Add temporary logging to verify secrets are accessible:

```typescript
export const handler = async (event: EventBridgeEvent<'Scheduled Event', {}>) => {
  console.log('AMPLIFY_SSM_ENV_CONFIG:', process.env.AMPLIFY_SSM_ENV_CONFIG);
  console.log('GRAPHQL_API_URL:', process.env.GRAPHQL_API_URL ? 'EXISTS' : 'MISSING');
  console.log('GRAPHQL_API_KEY:', process.env.GRAPHQL_API_KEY ? 'EXISTS' : 'MISSING');
  
  // ... rest of handler
};
```

**Expected:**
- `AMPLIFY_SSM_ENV_CONFIG`: Should contain SSM parameter paths
- `GRAPHQL_API_URL`: Should show "EXISTS" (actual value won't log for security)
- `GRAPHQL_API_KEY`: Should show "EXISTS"

## Solution: Verify Amplify Secrets Setup

The secrets need to be configured in Amplify. Check if they exist:

### Option 1: Check Amplify Console

1. Go to **AWS Amplify Console** → Your App
2. **App Settings** → **Environment Variables**
3. Look for `GRAPHQL_API_URL` and `GRAPHQL_API_KEY`
4. If missing, you may need to set them up

### Option 2: Check if Secrets Are Created During Deployment

Secrets should be automatically created if:
- They're referenced in function configurations
- The deployment completes successfully

### Option 3: Manual Secret Creation (If Needed)

If secrets don't exist, they may need to be created manually:

```bash
# Get your AppSync API URL and Key from Amplify outputs
# Then create SSM parameters:

aws ssm put-parameter \
  --name "/amplify/<app-id>/<env>/GRAPHQL_API_URL" \
  --value "<your-appsync-url>" \
  --type "String" \
  --region <your-region>

aws ssm put-parameter \
  --name "/amplify/<app-id>/<env>/GRAPHQL_API_KEY" \
  --value "<your-appsync-api-key>" \
  --type "SecureString" \
  --region <your-region>
```

**Note:** The exact parameter path format depends on how Amplify structures it. Check existing working functions' SSM parameters for the correct path format.

## Alternative: Use Data Resource Reference

Instead of using secrets, you could potentially reference the data resource directly. However, this requires accessing the backend resources in the function definition, which may not be straightforward for standalone scheduled functions.

## Current Configuration Analysis

Your current setup:
- ✅ Function uses `secret('GRAPHQL_API_URL')` - **Correct**
- ✅ Function uses `secret('GRAPHQL_API_KEY')` - **Correct**
- ✅ Same pattern as working functions - **Correct**
- ❓ Secrets may not exist in SSM - **Needs verification**
- ❓ Lambda role may lack SSM permissions - **Needs verification**

## Next Steps

1. **Verify SSM parameters exist** (Step 1)
2. **Check IAM permissions** (Step 2)
3. **Test function with logging** (Step 5)
4. **Compare with working function configuration**
5. **If still failing, check Amplify deployment logs for secret creation errors**

## Expected Behavior After Fix

Once properly configured:
- ✅ Lambda Console shows only `AMPLIFY_SSM_ENV_CONFIG` (this is normal)
- ✅ Function can access `process.env.GRAPHQL_API_URL` at runtime
- ✅ Function can access `process.env.GRAPHQL_API_KEY` at runtime
- ✅ No "AppSync URL not configured" errors

