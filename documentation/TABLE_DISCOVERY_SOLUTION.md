# Table Discovery Solution - Multi-Branch Safe Implementation

## Problem Analysis

### Original Issue
The table discovery utility was using a simple approach that always fell back to `DynamoDB ListTables`, which:
1. Was confusing due to misleading log messages
2. **Was unsafe for multi-branch deployments** - could return tables from wrong branch
3. Didn't leverage Amplify Gen 2's CloudFormation infrastructure

### Critical Multi-Branch Scenario

When multiple branches are deployed to the same AWS account:
```
AWS Account (us-east-1):
├── SESCampaignContact-abc123-main      (main branch)
├── SESCampaignContact-xyz789-dev       (dev branch)
└── SESCampaignContact-qwe456-feature   (feature branch)
```

**Risk:** Scripts could accidentally find and modify the wrong branch's data!

## Solution Architecture

### Three-Tier Discovery Strategy

```
┌─────────────────────────────────────────────────────┐
│  1. Environment Variable (Explicit Override)        │
│     Priority: HIGHEST                               │
│     Use Case: CI/CD, explicit control               │
└─────────────────────────────────────────────────────┘
                        ↓ (if not set)
┌─────────────────────────────────────────────────────┐
│  2. CloudFormation Stack Outputs (Recommended)      │
│     Priority: HIGH                                  │
│     Use Case: Branch-safe auto-discovery            │
│     ✓ Multi-branch safe                             │
│     ✓ Environment-aware                             │
└─────────────────────────────────────────────────────┘
                        ↓ (if fails)
┌─────────────────────────────────────────────────────┐
│  3. DynamoDB ListTables (Fallback)                  │
│     Priority: LOWEST                                │
│     Use Case: When CloudFormation unavailable       │
│     ⚠ Warns if multiple tables found                │
└─────────────────────────────────────────────────────┘
```

### Implementation Details

#### 1. CloudFormation Outputs (`amplify/backend.ts`)

Added stack outputs for table names:
```typescript
const dataStack = backend.data.stack;
dataStack.addOutputs({
  SESCampaignContactTableName: {
    value: contactTable.tableName,
    description: 'DynamoDB table name for SES Campaign Contacts',
  },
  SESCampaignControlTableName: {
    value: controlTable.tableName,
    description: 'DynamoDB table name for SES Campaign Control',
  },
});
```

**Benefits:**
- CloudFormation knows which tables belong to which branch/environment
- Scripts can query the deployed stack to get the correct table names
- No ambiguity in multi-branch scenarios

#### 2. Enhanced Discovery Utility (`scripts/utils/table-discovery.ts`)

**New Function Signature:**
```typescript
export async function discoverTableName(
  modelName: string,           // e.g., 'SESCampaignContact'
  envVarName?: string,          // e.g., 'CONTACT_TABLE_NAME'
  outputKeyName?: string        // e.g., 'SESCampaignContactTableName'
): Promise<string>
```

**Key Features:**
- ✅ CloudFormation-based discovery (queries stack outputs)
- ✅ Multi-branch safety (finds correct environment's tables)
- ✅ Clear warning messages when multiple tables found
- ✅ Graceful fallback chain
- ✅ Detailed error messages with troubleshooting steps

#### 3. Updated Scripts

Both `import-contacts.ts` and `toggle-campaign.ts` now use the enhanced discovery:
```typescript
const tableName = await discoverTableName(
  'SESCampaignContact', 
  'CONTACT_TABLE_NAME',
  'SESCampaignContactTableName'  // CloudFormation output key
);
```

## Security & Permissions

### Required AWS Permissions

**Recommended (Full Branch Safety):**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cloudformation:DescribeStacks"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:ListTables",
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:BatchWriteItem",
        "dynamodb:BatchGetItem",
        "dynamodb:UpdateItem",
        "dynamodb:Query"
      ],
      "Resource": "*"
    }
  ]
}
```

**Minimum (With Environment Variables):**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:BatchWriteItem",
        "dynamodb:BatchGetItem",
        "dynamodb:UpdateItem",
        "dynamodb:Query"
      ],
      "Resource": "arn:aws:dynamodb:REGION:ACCOUNT:table/SPECIFIC-TABLE-NAME"
    }
  ]
}
```

## Usage Examples

### 1. Automatic Discovery (Recommended)
```bash
cd scripts
npm run import contacts.xlsx
npm run toggle status
```

The scripts will automatically:
1. Query CloudFormation for the correct table names
2. Use the tables from the currently deployed environment
3. Warn if multiple matches found

### 2. Explicit Override (CI/CD)
```bash
CONTACT_TABLE_NAME=SESCampaignContact-abc123-main npm run import contacts.xlsx
CAMPAIGN_CONTROL_TABLE_NAME=SESCampaignControl-abc123-main npm run toggle enable
```

### 3. Multi-Branch Workflow
```bash
# Working on dev branch
git checkout dev
npx ampx sandbox  # Deploys dev environment

cd scripts
npm run import dev-contacts.xlsx  # ✓ Uses dev tables automatically

# Switch to main branch
git checkout main
npx ampx sandbox  # Deploys main environment

npm run import prod-contacts.xlsx  # ✓ Uses main tables automatically
```

## Benefits

### 1. **Multi-Branch Safety**
- No more accidentally operating on wrong environment's data
- CloudFormation ensures branch-environment mapping

### 2. **Developer Experience**
- Clear console messages with ✓ and ⚠ indicators
- Helpful troubleshooting steps in error messages
- Warnings when ambiguous situations detected

### 3. **Flexibility**
- Works with single-branch deployments (simple case)
- Handles multi-branch deployments (complex case)
- Supports explicit overrides when needed

### 4. **Alignment with AWS Best Practices**
- Uses CloudFormation infrastructure
- Follows least-privilege principle
- Environment variables for CI/CD

### 5. **Maintainability**
- Clean, well-documented code
- Consistent error handling
- Easy to extend for new tables

## Migration Notes

### For Existing Deployments

1. **Backend Update Required:**
   - Deploy the updated `amplify/backend.ts` to add CloudFormation outputs
   - Run: `git push` or `npx ampx sandbox`

2. **Scripts Dependency Update:**
   ```bash
   cd scripts
   npm install
   ```
   This installs `@aws-sdk/client-cloudformation`

3. **No Breaking Changes:**
   - Existing environment variable usage still works
   - Fallback to ListTables still available
   - Scripts remain backward compatible

### For New Deployments

Everything works out of the box:
1. Deploy backend: `npx ampx sandbox`
2. Install script dependencies: `cd scripts && npm install`
3. Run scripts: `npm run import contacts.xlsx`

## Testing Recommendations

### Test Scenarios

1. **Single Branch Deployment:**
   - ✅ Should discover table via CloudFormation
   - ✅ Should work with ListTables fallback

2. **Multi-Branch Deployment:**
   - ✅ Should warn if multiple tables found (ListTables fallback)
   - ✅ Should use correct branch via CloudFormation

3. **Environment Variable Override:**
   - ✅ Should always use specified table
   - ✅ Should skip CloudFormation/ListTables queries

4. **Permission Scenarios:**
   - ✅ With CloudFormation access: Fast, branch-safe
   - ✅ Without CloudFormation access: Falls back to ListTables with warnings
   - ✅ With explicit env vars: Works with minimal permissions

## Future Enhancements

Potential improvements for consideration:

1. **Cache Discovered Table Names:**
   - Store in local `.amplify-cache` file
   - Speeds up subsequent script runs
   - Invalidate on branch changes

2. **Branch Detection from Git:**
   - Read current git branch
   - Filter CloudFormation stacks by branch name
   - Even more precise matching

3. **Interactive Table Selection:**
   - If multiple tables found, prompt user to choose
   - Better than defaulting to first match

4. **Integration with `amplify_outputs.json`:**
   - Parse resource identifiers from outputs file
   - Use as additional discovery method

## Conclusion

This solution provides a **robust, branch-safe, and maintainable** approach to table discovery that:
- Prevents data mishaps in multi-branch environments
- Follows AWS and Amplify Gen 2 best practices
- Maintains simplicity for single-branch deployments
- Provides clear feedback and error messages
- Requires minimal changes to existing code

The implementation is **production-ready** and has been designed with security, reliability, and developer experience as top priorities.

