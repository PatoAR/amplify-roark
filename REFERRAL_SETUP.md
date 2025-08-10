# Referral System Setup Guide

## The Problem
The post-confirmation Lambda function was failing with "AppSync URL not configured" because it couldn't access the GraphQL API configuration in the AWS environment.

## The Solution
We've implemented the **Amplify Gen 2 secrets approach** as recommended by AWS. This is more secure than environment variables and follows AWS best practices.

**All three Lambda functions now use the same secure approach:**
- `postConfirmation` (Cognito trigger)
- `referral-api` (HTTP API)
- `referral-processor` (Event-driven)

## Required Secrets

### 1. Set Secrets in Amplify Console

Go to your Amplify Console and set these secrets:

1. Navigate to **Hosting > Secrets**
2. Click **Manage secrets**
3. Add these two secrets:

```
GRAPHQL_API_URL=https://xxxxxx.appsync-api.us-east-1.amazonaws.com/graphql
GRAPHQL_API_KEY=your_api_key_here
```

### 2. How to Find These Values

#### AppSync URL
1. Go to AWS AppSync Console
2. Select your API
3. Copy the GraphQL endpoint URL

#### API Key
1. In the same AppSync API
2. Go to "API Keys" section
3. Copy the API key (or create a new one if needed)

### 3. Setting Secrets

#### Option A: Amplify Console (Recommended)
1. Go to Amplify Console → App home page
2. Navigate to **Hosting > Secrets**
3. Click **Manage secrets**
4. Add `GRAPHQL_API_URL` and `GRAPHQL_API_KEY` secrets
5. Choose whether they apply to all branches or specific branches

#### Option B: Local Development (Sandbox)
If testing locally with cloud sandbox:
```bash
npx ampx sandbox secret set GRAPHQL_API_URL
# Enter your AppSync URL when prompted

npx ampx sandbox secret set GRAPHQL_API_KEY
# Enter your API key when prompted
```

## Why This Approach is Better

1. **More Secure**: Secrets are encrypted and stored in AWS Systems Manager Parameter Store
2. **Follows AWS Best Practices**: This is the recommended approach for Amplify Gen 2
3. **Centralized Management**: All secrets managed in one place (Amplify console)
4. **Branch-Specific**: Easy to manage different values for dev vs prod branches
5. **No Plaintext Storage**: Unlike environment variables, secrets are never stored in plaintext
6. **Automatic Encryption**: AWS handles encryption and security
7. **Consistent Across Functions**: All three Lambda functions use the same secure pattern
8. **Simplified Authentication**: API key authentication instead of complex AWS SDK signing

## How Secrets Work

Secrets are stored in AWS Systems Manager Parameter Store under these naming conventions:
- **All branches**: `/amplify/shared/<app-id>/<secret-key>`
- **Specific branch**: `/amplify/<app-id>/<branchname>-branch-<unique-hash>/<secret-key>`

## Functions Updated

The following Lambda functions have been updated to use the secrets approach:

1. **`postConfirmation`** - Cognito post-confirmation trigger
   - Handles user signup and referral processing
   - Creates UserSubscription records
   - Processes referral bonuses

2. **`referral-api`** - HTTP API for referral operations
   - Generate referral codes
   - Validate referral codes
   - Process referrals
   - Extend subscriptions

3. **`referral-processor`** - Event-driven referral processing
   - Background processing of referral events
   - Same core functionality as referral-api but event-driven

## Fallback Support

The code still supports the old environment variable as fallback:
- `API_AMPLIFY_GRAPHQLAPIENDPOINTOUTPUT` (old AppSync URL variable)
- This ensures backward compatibility during migration

## Testing

After setting the secrets:

1. Deploy your changes
2. Test all three functions:
   - Try signing up a new user with a referral code (tests postConfirmation)
   - Test referral code generation (tests referral-api)
   - Test referral validation (tests referral-api)
   - Check CloudWatch logs for all functions
3. You should see successful GraphQL operations instead of "AppSync URL not configured" errors

## Troubleshooting

If you still get errors:

1. **Check Secrets**: Verify they're set correctly in Amplify Console → Hosting → Secrets
2. **Check Secret Names**: Ensure they're exactly `GRAPHQL_API_URL` and `GRAPHQL_API_KEY`
3. **Check API Key Permissions**: Ensure the API key has access to your GraphQL schema
4. **Check AppSync URL**: Verify the URL is correct and accessible
5. **Check CloudWatch Logs**: Look for detailed error messages in all function logs
6. **Check All Functions**: Ensure all three functions are deployed with the updated code

## Migration from Environment Variables

If you were previously using environment variables:
1. Set the secrets in Amplify Console
2. Deploy the updated code for all three functions
3. Remove the old environment variables from Lambda (optional, for cleanup)

## Next Steps

1. Set the secrets in Amplify Console
2. Deploy the changes for all three functions
3. Test the referral system end-to-end
4. Monitor CloudWatch logs for any remaining issues

## Security Benefits

- **Encrypted at Rest**: All secrets are encrypted using AWS KMS
- **Access Control**: IAM policies control who can access secrets
- **Audit Trail**: AWS CloudTrail logs all secret access
- **No Code Exposure**: Secrets are never visible in your code or build artifacts
- **Consistent Security**: All functions use the same secure authentication pattern
