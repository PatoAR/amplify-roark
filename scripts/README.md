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

**Note:** Table names will have a hash suffix (e.g., `SESCampaignContact-abc123-NONE`). The scripts automatically discover the correct table names.

### Table Discovery

Scripts automatically discover table names using a **branch-aware** approach that prevents accidentally operating on tables from different branches/environments.

**Discovery Order:**

1. **Environment variables** (explicit override - highest priority):
   ```bash
   CONTACT_TABLE_NAME=SESCampaignContact-abc123-main npm run import contacts.xlsx
   CAMPAIGN_CONTROL_TABLE_NAME=SESCampaignControl-xyz789-main npm run toggle status
   ```

2. **CloudFormation stack outputs** (recommended - branch-safe):
   - Queries CloudFormation for deployed Amplify data stacks
   - Automatically identifies tables for the current environment
   - Requires `cloudformation:DescribeStacks` permission
   - **Safe for multi-branch deployments**

3. **DynamoDB ListTables** (fallback):
   - Direct table listing by name prefix
   - Requires `dynamodb:ListTables` permission
   - ⚠️ **Warns if multiple matching tables found** (multi-branch scenario)

**Multi-Branch Safety:**
When multiple branches are deployed to the same AWS account (e.g., `main`, `dev`, `feature`), the CloudFormation-based discovery ensures you're operating on the correct environment's tables. If CloudFormation access is unavailable, the script will warn you if multiple matching tables are found.

**Best Practices:**
- **Development:** CloudFormation discovery works automatically
- **CI/CD pipelines:** Use environment variables for explicit control
- **Multi-branch setups:** Ensure `cloudformation:DescribeStacks` permission is granted

**Initial Control Item:**
After deployment, create the initial control item using the toggle script:
```bash
npm run toggle enable
```

Or manually via AWS Console:
1. Go to DynamoDB Console → Find table starting with `SESCampaignControl`
2. Items tab → Create item
3. Add: `id` = `"main"`, `control` = `"main"`, `isEnabled` = `true`, `lastUpdated` = current ISO timestamp
4. Save

## Troubleshooting

**Error: Table not found**
- Ensure the Amplify backend is deployed: `npx ampx sandbox` or push to Git
- Verify you're connected to the correct AWS account and region: `aws sts get-caller-identity`
- Check available tables in AWS Console → DynamoDB
- Manually specify table name via environment variable:
  ```bash
  CONTACT_TABLE_NAME=YourTableName npm run import contacts.xlsx
  ```

**Error: Access denied**
- Verify AWS credentials are configured correctly: `aws configure`
- Ensure IAM user/role has required permissions:
  - `cloudformation:DescribeStacks` (recommended for branch-safe discovery)
  - `dynamodb:ListTables` (fallback discovery)
  - `dynamodb:GetItem`, `dynamodb:PutItem`, `dynamodb:BatchWriteItem`, `dynamodb:BatchGetItem`
- Alternative: Use environment variables to bypass discovery (only needs table-level permissions)

**Error: Missing columns**
- Verify Excel file has required columns: `Company`, `FirstName`, `LastName`, `email`
- Column names are case-sensitive
- Optional column: `Language` (defaults to 'es' if missing)

**Slow table discovery**
- CloudFormation queries are fast and efficient
- DynamoDB ListTables fallback may take a few seconds
- Speed up by using environment variables (no API call needed)
- The discovered table name is logged for future reference

**Multiple tables found warning**
- Occurs when multiple branches are deployed to the same AWS account
- The script will warn you and show all matching tables
- Ensure you're using the correct table by:
  1. Granting `cloudformation:DescribeStacks` permission (recommended)
  2. Using environment variables to explicitly specify the table

