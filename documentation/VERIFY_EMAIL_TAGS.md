# How to Verify Email Tags Are Working

Email tags are used to pass the DynamoDB table name with each email, enabling multi-branch bounce handling. This guide shows you how to verify they're working correctly.

## Quick Verification Methods

### Method 1: Use the Verification Script (Recommended)

```powershell
cd scripts
npm run verify-email-tags
```

This script will:
- Check CloudWatch logs for recent SNS bounce notifications
- Parse the SNS message to find email tags
- Report whether `campaign-table` tag is present
- Show the tag value if found

**Expected Output (Tags Working):**
```
✅ Found SNS bounce notification

📧 Email Details:
   From: Perkins Intelligence <info@perkinsintel.com>
   To: bounce@simulator.amazonses.com
   Message ID: 0100019af0df7d88-...

🏷️  Email Tags:
   ✅ campaign-table tag found: SESCampaignContact-p7l2jyarsfe5netqwh7uthfc3i-NONE
   ✅ Multi-branch support is WORKING
   ✅ Tag format is correct (starts with SESCampaignContact)
```

**Expected Output (Tags NOT Working):**
```
🏷️  Email Tags:
   ⚠️  campaign-table tag NOT found
   ⚠️  Bounce handler will use fallback table name
   ⚠️  Multi-branch support may not work correctly
```

### Method 2: Check CloudWatch Logs Manually

1. **Go to CloudWatch Console:**
   - AWS Console → CloudWatch → Log groups
   - Find: `/aws/lambda/amplify-{app-id}-{env}-sesbouncehandlerlambda83-{hash}`

2. **Find a recent bounce event:**
   - Look for log entries with "Received SNS event"
   - Click on the log entry to expand it

3. **Check the SNS message JSON:**
   - Find the `"mail"` object in the JSON
   - Look for a `"tags"` field inside `"mail"`
   - Check if `"tags"` contains `"campaign-table"`

**Example (Tags Present):**
```json
{
  "mail": {
    "timestamp": "2025-12-05T23:36:09.864Z",
    "source": "Perkins Intelligence <info@perkinsintel.com>",
    "tags": {
      "campaign-table": ["SESCampaignContact-p7l2jyarsfe5netqwh7uthfc3i-NONE"]
    },
    ...
  }
}
```

**Example (Tags Missing):**
```json
{
  "mail": {
    "timestamp": "2025-12-05T23:36:09.864Z",
    "source": "Perkins Intelligence <info@perkinsintel.com>",
    // No "tags" field
    ...
  }
}
```

### Method 3: Check Bounce Handler Logs

The bounce handler logs which table it's using. Check CloudWatch logs for:

```
Processing Permanent bounce with 1 recipients for table: SESCampaignContact-p7l2jyarsfe5netqwh7uthfc3i-NONE
```

- **If the table name matches your branch's table:** Tags are working ✅
- **If the table name is just `SESCampaignContact`:** Tags are missing, using fallback ⚠️

### Method 4: Check the Code

Verify that `ses-campaign-sender` includes tags:

**File:** `amplify/functions/ses-campaign-sender/handler.ts`

**Look for:**
```typescript
Tags: [
  {
    Name: 'campaign-table',
    Value: CONTACT_TABLE_NAME,
  },
],
```

This should be inside the `SendEmailCommand` around line 130.

## Troubleshooting

### Tags Not Found

If tags are missing, check:

1. **Was the email sent AFTER deploying tag changes?**
   - Tags are added when the email is sent
   - Old emails won't have tags
   - Send a new test email after deployment

2. **Is the code deployed?**
   ```powershell
   git status  # Check for uncommitted changes
   git log --oneline -5  # Check recent commits
   ```

3. **Check SES email sending:**
   - Verify `SendEmailCommand` includes `Tags` array
   - Check that `CONTACT_TABLE_NAME` environment variable is set

4. **Verify deployment:**
   - Check AWS Amplify build logs
   - Ensure no build errors related to `ses-campaign-sender`

### Tags Present But Wrong Table

If tags are present but point to the wrong table:

1. **Check environment variable:**
   - The `CONTACT_TABLE_NAME` in `ses-campaign-sender` should match your branch's table
   - Verify in `amplify/backend.ts` that it's set correctly

2. **Check branch context:**
   - Each branch should have its own table
   - The tag should include the branch identifier in the table name

## Why Tags Matter

**Without Tags:**
- Bounce handler uses fallback table name (`SESCampaignContact`)
- May update wrong table in multi-branch deployments
- Bounces from `dev` branch might update `main` branch table

**With Tags:**
- Bounce handler knows exactly which table to update
- Each branch's bounces are isolated
- Multi-branch deployments work correctly

## Testing Tags

To test if tags are working:

1. **Send a test bounce email:**
   ```powershell
   cd scripts
   npm run test-bounce bounce@simulator.amazonses.com <function-url>
   ```

2. **Wait 1-2 minutes** for SES to process the bounce

3. **Run verification:**
   ```powershell
   npm run verify-email-tags
   ```

4. **Check results:**
   - Tags found = ✅ Working
   - Tags missing = ⚠️ Need to investigate

## Next Steps

If tags are working:
- ✅ Multi-branch bounce handling is ready
- ✅ No further action needed

If tags are missing:
- Check deployment status
- Verify code includes Tags in SendEmailCommand
- Send a new test email after confirming deployment
- Re-run verification

