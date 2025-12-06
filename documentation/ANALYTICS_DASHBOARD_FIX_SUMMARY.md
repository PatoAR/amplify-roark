# Analytics Dashboard Fix - SES Campaign Metrics

## Problem Summary

The Analytics Dashboard's SES Campaign section was showing zero values for all metrics despite having data in the DynamoDB tables. The root cause was a GraphQL code generation issue.

## Root Cause Analysis

### What Was Wrong

1. **Outdated Code Generation Command**: The project was using `npx @aws-amplify/cli codegen` (Amplify Gen 1 command) which reads from `schema.json`
2. **Outdated schema.json**: The `schema.json` file didn't contain the SESCampaignContact and SESCampaignControl models
3. **Missing Queries**: The generated `src/graphql/queries.ts` didn't include `listSESCampaignContacts` query
4. **Duplicate API.ts Files**: There were two API.ts files:
   - `src/API.ts` (outdated, missing SES types)
   - `src/graphql/API.ts` (correct, with SES types)

### Why It Happened

When deploying to AWS (`git push`), the backend was correctly deployed with SES tables. However, running `npx @aws-amplify/cli codegen` locally pulled an outdated schema that didn't reflect the deployed changes.

## Solution Implemented

### 1. Deleted Outdated Files
- Removed `src/API.ts` (outdated file without SES types)

### 2. Updated Configuration
- Modified `.graphqlconfig.yml` to point to `src/graphql/API.ts`
- Removed `src/API.ts` from excludes list

### 3. Regenerated GraphQL Code
- Used correct Amplify Gen 2 command:
  ```bash
  npx ampx generate graphql-client-code --format graphql-codegen --out ./src/graphql/
  ```

### 4. Verified Generated Code
- Confirmed `listSESCampaignContacts` query exists in `src/graphql/queries.ts`
- Verified TypeScript types exist in `src/graphql/API.ts`
- All SES-related types and queries are now present:
  - `SESCampaignContact` type
  - `SESCampaignControl` type
  - `listSESCampaignContacts` query
  - `listSESCampaignContactByEmail` query (GSI)
  - `listSESCampaignContactBySent_Status` query (GSI)
  - `listSESCampaignControlByControl` query (GSI)

### 5. Updated Documentation
- Updated `README.md` with correct code generation workflow
- Created `GRAPHQL_CODEGEN_WORKFLOW.md` with comprehensive guide

## What Changed

### Files Modified
- `.graphqlconfig.yml` - Updated to use `src/graphql/API.ts`
- `README.md` - Added correct codegen workflow
- `src/graphql/API.ts` - Regenerated with SES types
- `src/graphql/queries.ts` - Regenerated with SES queries
- `src/graphql/mutations.ts` - Regenerated with SES mutations
- `src/graphql/subscriptions.ts` - Regenerated with SES subscriptions

### Files Deleted
- `src/API.ts` - Outdated file without SES types

### Files Created
- `documentation/GRAPHQL_CODEGEN_WORKFLOW.md` - Comprehensive guide
- `documentation/ANALYTICS_DASHBOARD_FIX_SUMMARY.md` - This file

## Verification Steps

### 1. Check Generated Queries
```bash
grep -r "listSESCampaignContacts" src/graphql/
```
**Expected Output:**
```
src/graphql/queries.ts:421:export const listSESCampaignContacts = ...
```

### 2. Check TypeScript Types
```bash
grep "export type SESCampaignContact" src/graphql/API.ts
```
**Expected Output:**
```typescript
export type SESCampaignContact = {
  __typename: "SESCampaignContact",
  Company: string,
  Company_Sequence?: number | null,
  Error_Status?: string | null,
  FirstName: string,
  Language?: string | null,
  LastName: string,
  Send_Group_ID: number,
  Sent_Date?: string | null,
  Sent_Status?: string | null,
  Target_Send_Date: string,
  createdAt: string,
  email: string,
  id: string,
  updatedAt: string,
};
```

### 3. Build Project
```bash
npm run build
```
**Expected:** No TypeScript errors

### 4. Test Analytics Dashboard
1. Deploy changes: `git push`
2. Wait for deployment to complete
3. Navigate to Analytics Dashboard
4. Verify SES Campaign Metrics section shows:
   - Total Contacts (should be > 0 if data exists)
   - Contacts Sent
   - Contacts Pending
   - Success Rate
   - Language Distribution
   - Top Companies

## Analytics Dashboard Query Flow

### How It Works Now

1. **Component Mount**: `AnalyticsDashboard.tsx` loads
2. **Authentication Check**: Verifies user is master user
3. **Data Fetch**: Calls `fetchAllSESCampaignContacts()`
4. **GraphQL Query**: Uses `listSESCampaignContacts` from `src/graphql/queries.ts`
5. **API Call**: Sends query to AppSync API
6. **Authorization**: AppSync checks authorization rules:
   ```typescript
   allow.authenticated().to(['read'])  // ✅ Allows authenticated users
   ```
7. **Data Retrieval**: DynamoDB returns SESCampaignContact items
8. **Metrics Calculation**: `calculateSESCampaignMetrics()` processes data
9. **Display**: Metrics rendered in dashboard cards

### Query Structure

```graphql
query ListSESCampaignContacts(
  $filter: ModelSESCampaignContactFilterInput
  $limit: Int
  $nextToken: String
) {
  listSESCampaignContacts(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      Company
      Company_Sequence
      Error_Status
      FirstName
      Language
      LastName
      Send_Group_ID
      Sent_Date
      Sent_Status
      Target_Send_Date
      createdAt
      email
      id
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
```

## Authorization Configuration

The SESCampaignContact model has the following authorization rules:

```typescript
SESCampaignContact: a
  .model({
    // ... fields
  })
  .authorization(allow => [
    // Backend access via API key (Lambda functions)
    allow.publicApiKey().to(['create', 'read', 'update']),
    // Allow authenticated users to read (for analytics dashboard)
    allow.authenticated().to(['read']),
  ])
```

This ensures:
- ✅ Lambda functions can create/update contacts (via API key)
- ✅ Authenticated users can read contacts (for dashboard)
- ✅ No public access without authentication

## Correct Workflow Going Forward

### When Making Schema Changes

1. **Edit Schema**: Modify `amplify/data/resource.ts`
2. **Generate Code**: Run `npx ampx generate graphql-client-code --format graphql-codegen --out ./src/graphql/`
3. **Verify**: Check generated files have new types/queries
4. **Build**: Run `npm run build` to verify no errors
5. **Test Locally**: Run `npm run dev` and test changes
6. **Commit**: `git add . && git commit -m "Add new model"`
7. **Deploy**: `git push`

### ❌ What NOT to Do

- ❌ Don't use `npx @aws-amplify/cli codegen` (Gen 1 command)
- ❌ Don't manually edit generated files (API.ts, queries.ts, etc.)
- ❌ Don't modify `schema.json` directly
- ❌ Don't skip the code generation step after schema changes

## Troubleshooting

### If SES Metrics Still Show Zero

1. **Check Data Exists in DynamoDB**:
   - Go to AWS Console → DynamoDB → Tables
   - Find `SESCampaignContact-{hash}` table
   - Verify items exist

2. **Check Authorization**:
   - Verify you're logged in as master user
   - Check browser console for GraphQL errors

3. **Check Query Response**:
   - Open browser DevTools → Network tab
   - Filter for GraphQL requests
   - Check response has data

4. **Regenerate Code**:
   ```bash
   npx ampx generate graphql-client-code --format graphql-codegen --out ./src/graphql/
   npm run build
   ```

5. **Check Deployed Schema**:
   - Verify backend deployment completed successfully
   - Check AWS Amplify Console → App → Backend environments

## Testing Checklist

- [x] Build succeeds without TypeScript errors
- [x] `listSESCampaignContacts` query exists in `src/graphql/queries.ts`
- [x] `SESCampaignContact` type exists in `src/graphql/API.ts`
- [ ] Analytics Dashboard loads without errors (requires deployment)
- [ ] SES Campaign Metrics show correct values (requires deployment + data)
- [ ] All cards display non-zero values (requires data in DynamoDB)

## Next Steps

1. **Deploy Changes**:
   ```bash
   git add .
   git commit -m "Fix Analytics Dashboard SES metrics - regenerate GraphQL code"
   git push
   ```

2. **Wait for Deployment**: Check AWS Amplify Console for completion

3. **Test Dashboard**:
   - Log in as master user
   - Navigate to Analytics Dashboard
   - Verify SES Campaign Metrics section shows data

4. **Monitor Logs**: If issues persist, check:
   - Browser console for errors
   - Network tab for GraphQL responses
   - AWS CloudWatch logs for Lambda errors

## Summary

The fix involved switching from the outdated Amplify Gen 1 codegen command to the correct Amplify Gen 2 command, which properly generates TypeScript types and GraphQL queries from the local schema definition. This ensures the frontend code is always in sync with the backend schema.

**Key Takeaway**: Always use `npx ampx generate graphql-client-code` in Amplify Gen 2 projects, not `npx @aws-amplify/cli codegen`.

