# SES Campaign Setup Guide

This guide explains how to set up and use the SES email campaign system.

## Overview

The SES campaign system automates sending 1,320 professional invitations with:
- Daily warm-up limits (starting at 50/day)
- 3-day spacing between contacts from the same company
- Timezone-aware scheduling (8 AM - 5 PM Buenos Aires time)
- Test email functionality
- Campaign on/off control

## Architecture

### Components

1. **DynamoDB Tables**
   - `Perkins_Intelligence_Contact_List` - Stores contact information and send status
   - `SES_Campaign_Control` - Controls campaign enable/disable state

2. **Lambda Function**
   - `ses-campaign-sender` - Handles scheduled sends and test emails

3. **EventBridge Schedule**
   - Runs hourly during business hours (8 AM - 5 PM Buenos Aires time)

4. **Scripts**
   - `import-contacts.ts` - Import contacts from Excel
   - `toggle-campaign.ts` - Enable/disable campaign

## Setup Steps

### 1. DynamoDB Tables (Automatic)

**Tables are created automatically** when you deploy via Git push or `npx amplify sandbox`. The tables are defined in `amplify/data/resource.ts`:

- **SESCampaignContact** - Stores contact information and send status
  - Primary key: `email` (String)
  - GSI: `Sent_Status` (Boolean) + `Target_Send_Date` (String)
  
- **SESCampaignControl** - Controls campaign enable/disable state
  - Primary key: `control` (String) - fixed value: "main"

**Create Initial Control Item:**
After deployment, create the initial control item via AWS Console or script:
1. Go to DynamoDB Console → Tables → `SESCampaignControl-{hash}`
2. Items tab → Create item
3. Add attribute: `control` = `"main"` (String)
4. Add attribute: `isEnabled` = `true` (Boolean)
5. Add attribute: `lastUpdated` = `"2024-01-01T00:00:00Z"` (String)
6. Save item

**Or use the toggle script after first deployment:**
```bash
cd scripts
npm install
npm run toggle enable
```

### 2. Deploy Backend (Creates Tables Automatically)

The tables will be created automatically when you deploy:

```bash
# For local development
npx amplify sandbox

# For production (via Git push)
git push origin main
```

### 3. Configure SES

1. **Verify Sender Email:**
   - Go to SES Console → Verified identities
   - Verify `info@perkinsintel.com`

2. **Request Production Access:**
   - If in sandbox mode, request production access
   - Go to SES Console → Account dashboard → Request production access

3. **Configure Bounce/Complaint Handling (Optional):**
   - Set up SNS topics for bounces and complaints
   - Configure Lambda functions to handle these events

### 4. Import Contacts

1. Prepare Excel file with columns: `Company`, `FirstName`, `LastName`, `email`
2. Run import script:
```bash
cd scripts
npm install
npm run import contacts.xlsx
```

**Note:** The script automatically discovers the correct DynamoDB table name by querying CloudFormation stacks. This works across different branches/environments (dev, main) without manual configuration. If you need to override the table name, set the `CONTACT_TABLE_NAME` environment variable.

### 5. Create Initial Campaign Control Item

After deployment, create the initial control item:

```bash
cd scripts
npm install
npm run toggle enable
```

### 6. Test Email Endpoint

After deployment, get the Function URL from AWS Console:
1. Go to Lambda Console → `ses-campaign-sender` function
2. Go to Configuration → Function URL
3. Copy the Function URL

**Test with curl (Linux/Mac/Git Bash):**
```bash
curl -X POST https://<function-url> \
  -H "Content-Type: application/json" \
  -d '{"testEmail": "your-email@example.com", "firstName": "Test"}'
```

**Test with PowerShell (Windows):**
```powershell
# Option 1: Use Invoke-RestMethod (recommended - handles JSON automatically)
Invoke-RestMethod -Uri "https://u4ojnz3dhwjeaet7vq5yncdqha0drxdc.lambda-url.us-east-1.on.aws/" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"testEmail": "pja2004@gmail.com", "firstName": "Patricio"}'

# Option 2: Use curl.exe with here-string (most reliable for curl.exe)
$json = @'
{"testEmail": "pja2004@gmail.com", "firstName": "Patricio"}
'@
curl.exe -X POST https://u4ojnz3dhwjeaet7vq5yncdqha0drxdc.lambda-url.us-east-1.on.aws/ `
  -H "Content-Type: application/json" `
  -d $json

# Option 3: Use curl.exe with single quotes (PowerShell 7+)
curl.exe -X POST https://u4ojnz3dhwjeaet7vq5yncdqha0drxdc.lambda-url.us-east-1.on.aws/ `
  -H 'Content-Type: application/json' `
  --data-raw '{"testEmail": "pja2004@gmail.com", "firstName": "Patricio"}'
```

### 7. Verify EventBridge Schedule

1. Go to EventBridge Console → Rules
2. Find rule: `ses-campaign-sender-<hash>`
3. Verify it's enabled and scheduled correctly

## Usage

### Enable/Disable Campaign

```bash
cd scripts
npm run toggle enable   # Enable campaign
npm run toggle disable  # Disable campaign
npm run toggle status   # Check status
```

### Monitor Campaign

1. **CloudWatch Logs:**
   - Go to Lambda Console → `ses-campaign-sender` → Monitor → View CloudWatch logs
   - Check for errors and send counts

2. **DynamoDB:**
   - Check `Perkins_Intelligence_Contact_List` table for send status
   - Filter by `Sent_Status = true` to see sent contacts
   - Check `Error_Status` field for failed sends

3. **SES Metrics:**
   - Go to SES Console → Account dashboard
   - Monitor sends, bounces, complaints, delivery rates

## Configuration

### Environment Variables

Set in `amplify/functions/ses-campaign-sender/resource.ts`:

- `SENDER_EMAIL`: `info@perkinsintel.com`
- `DAILY_SEND_LIMIT`: `50` (increase after warm-up period)
- `COMPANY_SPACING_DAYS`: `3`
- `CONTACT_TABLE_NAME`: `Perkins_Intelligence_Contact_List`
- `CAMPAIGN_CONTROL_TABLE_NAME`: `SES_Campaign_Control`

### Warm-up Schedule

Start at 50 emails/day, then gradually increase:
- Week 1: 50/day
- Week 2: 100/day
- Week 3: 200/day
- Week 4+: 500/day (or as needed)

Update `DAILY_SEND_LIMIT` environment variable and redeploy.

## Troubleshooting

### Campaign Not Sending

1. Check campaign status: `npm run toggle status`
2. Verify EventBridge schedule is enabled
3. Check Lambda logs for errors
4. Verify DynamoDB tables exist and have correct structure
5. Check SES sender email is verified

### Test Email Not Working

1. Verify Function URL is accessible
2. Check CORS headers in response
3. Verify request body format: `{"testEmail": "...", "firstName": "..."}`
4. Check Lambda logs for errors

### Import Script Errors

1. Verify Excel file has required columns
2. Check AWS credentials are configured
3. Verify DynamoDB tables exist (script auto-discovers table names via CloudFormation)
4. If table discovery fails, set `CONTACT_TABLE_NAME` environment variable manually
5. Ensure you have CloudFormation read permissions (`cloudformation:DescribeStacks`, `cloudformation:DescribeStackResources`)

## Security Notes

- Function URL is public (no auth) - use only for testing
- Consider adding authentication for production use
- DynamoDB tables should have appropriate IAM permissions
- SES sender email must be verified

## Support

For issues or questions:
1. Check CloudWatch logs
2. Review DynamoDB table contents
3. Verify SES configuration
4. Check EventBridge rule status

