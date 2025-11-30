# SES Campaign Scripts

This directory contains utility scripts for managing the SES email campaign.

## Prerequisites

1. **Install dependencies** (required before running scripts):
```bash
cd scripts
npm install
```

**Note:** The TypeScript linter will show "Cannot find module" errors until `npm install` is run. This is expected and will be resolved after installing dependencies.

2. Configure AWS credentials (via AWS CLI or environment variables):
```bash
aws configure
```

## Scripts

### import-contacts.ts

Imports contacts from an Excel file into DynamoDB.

**Usage:**
```bash
npm run import <excel-file-path> [start-date]
```

**Example:**
```bash
npm run import contacts.xlsx
npm run import contacts.xlsx 2024-01-15
```

**Excel Format:**
The Excel file must have the following columns:
- `Company` - Company name
- `FirstName` - Contact's first name
- `LastName` - Contact's last name
- `email` - Contact's email address
- `Language` - Preferred language for invitation email: `es` (Spanish), `en` (English), or `pt` (Portuguese). Optional - defaults to `es` if missing or invalid

**What it does:**
1. Reads contacts from Excel file
2. **Detects and removes duplicates within the Excel file** (based on email address)
3. **Checks for existing contacts in DynamoDB** to avoid overwriting
4. Groups contacts by Company
5. Calculates `Send_Group_ID` (grouped by company, then sequential)
6. Calculates `Target_Send_Date` with 3-day spacing between contacts from the same company
7. Writes only new contacts to DynamoDB table (skips duplicates)

**Duplicate Handling:**
- Duplicates within the Excel file are automatically detected and removed (keeps first occurrence)
- Contacts already in DynamoDB are skipped (prevents overwriting existing data)
- Email addresses are normalized (lowercase, trimmed) for comparison
- The script reports how many duplicates were found and skipped

### toggle-campaign.ts

Enable or disable the SES campaign.

**Usage:**
```bash
npm run toggle [enable|disable|status]
```

**Examples:**
```bash
npm run toggle enable   # Enable campaign
npm run toggle disable  # Disable campaign
npm run toggle status   # Show current status
```

**What it does:**
- Updates the `isEnabled` flag in the `SES_Campaign_Control` DynamoDB table
- When disabled, the Lambda function will skip execution even if triggered by EventBridge

## DynamoDB Tables Setup

**Tables are created automatically** when you deploy the backend via Git push or `npx amplify sandbox`. The tables are defined in `amplify/data/resource.ts`:

- **SESCampaignContact** - Contact list table (auto-created)
- **SESCampaignControl** - Campaign control table (auto-created)

**Note:** Table names will have a hash suffix (e.g., `SESCampaignContact-abc123`). The Lambda function automatically gets the correct table names from environment variables set by Amplify.

**Initial Control Item:**
After deployment, create the initial control item using the toggle script:
```bash
npm run toggle enable
```

Or manually via AWS Console:
1. Go to DynamoDB Console → Find table starting with `SESCampaignControl`
2. Items tab → Create item
3. Add: `control` = `"main"`, `isEnabled` = `true`, `lastUpdated` = current ISO timestamp
4. Save

## Troubleshooting

**Error: Table not found**
- Ensure DynamoDB tables are created before running scripts
- Check table names match exactly: `Perkins_Intelligence_Contact_List` and `SES_Campaign_Control`

**Error: Access denied**
- Verify AWS credentials are configured correctly
- Ensure IAM user/role has DynamoDB read/write permissions

**Error: Missing columns**
- Verify Excel file has required columns: Company, FirstName, LastName, email
- Column names are case-sensitive

