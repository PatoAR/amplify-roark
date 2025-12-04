# GraphQL Code Generation Workflow - Amplify Gen 2

## Overview

This document explains the correct workflow for generating GraphQL client code in Amplify Gen 2 projects and resolves the common issue where schema changes don't appear in generated code.

## Problem Statement

**Symptom:** After adding new models (e.g., SESCampaignContact, SESCampaignControl) to `amplify/data/resource.ts` and deploying to AWS, the generated GraphQL queries and TypeScript types don't include the new models.

**Root Cause:** Using the wrong code generation command. Amplify Gen 2 requires a different command than Amplify Gen 1.

## Solution

### Correct Command for Amplify Gen 2

```bash
npx ampx generate graphql-client-code --format graphql-codegen --out ./src/graphql/
```

This command:
- Reads the schema from `amplify/data/resource.ts` (local source of truth)
- Generates TypeScript types in `src/graphql/API.ts`
- Generates GraphQL queries in `src/graphql/queries.ts`
- Generates GraphQL mutations in `src/graphql/mutations.ts`
- Generates GraphQL subscriptions in `src/graphql/subscriptions.ts`

### ❌ Incorrect Command (Amplify Gen 1 Only)

```bash
npx @aws-amplify/cli codegen  # DO NOT USE - This is for Gen 1 only
```

This command:
- Is designed for Amplify Gen 1 projects
- Reads from `schema.json` which may be outdated
- Can cause schema synchronization issues
- Should NOT be used in Gen 2 projects

## Complete Workflow

### Working with Branches

#### Creating a New Branch

```bash
# 1. Create new branch
git checkout -b feature/new-feature

# 2. Push to remote
git push -u origin feature/new-feature

# 3. Configure in AWS Amplify Console
# - Go to Amplify Console → Your App → Connect branch
# - Select your branch and deploy
# - Each branch gets its own backend resources
```

**Important:** You don't need to regenerate GraphQL code when creating a branch unless you're making schema changes in that branch.

### 1. Make Schema Changes

Edit `amplify/data/resource.ts` to add/modify models:

```typescript
const schema = a.schema({
  // Your models here
  SESCampaignContact: a
    .model({
      email: a.string().required(),
      Company: a.string().required(),
      // ... other fields
    })
    .secondaryIndexes((index) => [
      index('email'),
    ])
    .authorization(allow => [
      allow.publicApiKey().to(['create', 'read', 'update']),
      allow.authenticated().to(['read']),
    ]),
});
```

### 2. Generate GraphQL Client Code

```bash
npx ampx generate graphql-client-code --format graphql-codegen --out ./src/graphql/
```

### 3. Verify Generated Files

Check that the new models appear in:
- `src/graphql/API.ts` - TypeScript types
- `src/graphql/queries.ts` - List and get queries
- `src/graphql/mutations.ts` - Create, update, delete mutations
- `src/graphql/subscriptions.ts` - Real-time subscriptions

```bash
# Quick verification
grep -r "SESCampaignContact" src/graphql/
```

### 4. Build and Test Locally

```bash
npm run build
```

Verify no TypeScript errors.

### 5. Commit and Deploy

```bash
git add .
git commit -m "Add SESCampaignContact model and regenerate GraphQL code"
git push
```

The AWS Amplify CI/CD pipeline will:
1. Deploy the backend changes (new DynamoDB tables, AppSync schema)
2. Build and deploy the frontend with the new types

## File Structure

```
amplify-roark/
├── amplify/
│   └── data/
│       └── resource.ts          # ✅ Source of truth for schema
├── src/
│   └── graphql/
│       ├── API.ts               # ✅ Generated TypeScript types
│       ├── queries.ts           # ✅ Generated queries
│       ├── mutations.ts         # ✅ Generated mutations
│       └── subscriptions.ts     # ✅ Generated subscriptions
├── schema.json                  # ⚠️ Outdated - not used in Gen 2
└── .graphqlconfig.yml           # ⚠️ For Gen 1 compatibility only
```

## Common Issues and Solutions

### Issue 1: Missing Types in Generated Code

**Symptom:** New models don't appear in `src/graphql/API.ts`

**Solution:**
1. Verify the model is correctly defined in `amplify/data/resource.ts`
2. Run the correct command: `npx ampx generate graphql-client-code --format graphql-codegen --out ./src/graphql/`
3. Check for errors in the command output

### Issue 2: TypeScript Import Errors

**Symptom:** `Cannot find module '../API'` or similar

**Solution:**
- Ensure you're importing from the correct location:
  ```typescript
  // ✅ Correct
  import { listSESCampaignContacts } from '../../graphql/queries';
  
  // ❌ Incorrect (old location)
  import { listSESCampaignContacts } from '../API';
  ```

### Issue 3: Schema Out of Sync

**Symptom:** Local schema differs from deployed schema

**Solution:**
1. Always generate from local source: `npx ampx generate graphql-client-code --format graphql-codegen --out ./src/graphql/`
2. Deploy changes: `git push`
3. The deployed schema will match your local schema

### Issue 4: Authorization Errors in Dashboard

**Symptom:** GraphQL queries return authorization errors

**Solution:**
- Verify authorization rules in `amplify/data/resource.ts`:
  ```typescript
  .authorization(allow => [
    allow.publicApiKey().to(['create', 'read', 'update']),
    allow.authenticated().to(['read']),  // ✅ Allows authenticated users to read
  ])
  ```

## Best Practices

### 1. Always Use Gen 2 Commands

- ✅ `npx ampx generate graphql-client-code --format graphql-codegen --out ./src/graphql/`
- ❌ `npx @aws-amplify/cli codegen`

### 2. Version Control

Commit generated files to Git:
```bash
git add src/graphql/
git commit -m "Regenerate GraphQL client code"
```

### 3. Consistent Workflow

1. Edit `amplify/data/resource.ts`
2. Generate code locally
3. Test locally (`npm run build` and `npm run dev`)
4. Commit and push
5. Verify in deployed environment

### 4. Authorization Configuration

Always configure appropriate authorization for analytics:
```typescript
.authorization(allow => [
  allow.publicApiKey().to(['create', 'read', 'update']),  // Lambda functions
  allow.authenticated().to(['read']),                      // Dashboard
])
```

## Troubleshooting Commands

```bash
# Verify schema is correct
cat amplify/data/resource.ts | grep -A 20 "SESCampaignContact"

# Verify generated types exist
grep -r "SESCampaignContact" src/graphql/

# Check for TypeScript errors
npm run build

# Test locally
npm run dev
```

## References

- [Amplify Gen 2 Documentation](https://docs.amplify.aws/gen2/)
- [GraphQL Code Generation](https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/)
- [Authorization Rules](https://docs.amplify.aws/gen2/build-a-backend/data/customize-authz/)

## Migration from Gen 1 to Gen 2

If you're migrating from Amplify Gen 1:

1. **Stop using** `npx @aws-amplify/cli codegen`
2. **Start using** `npx ampx generate graphql-client-code --format graphql-codegen --out ./src/graphql/`
3. **Delete** old `src/API.ts` file (if it exists separately from `src/graphql/API.ts`)
4. **Update** imports to use `src/graphql/` location
5. **Update** `.graphqlconfig.yml` to point to `src/graphql/API.ts`

## Summary

**Key Takeaway:** In Amplify Gen 2, always use `npx ampx generate graphql-client-code` to generate GraphQL client code from your local schema definition in `amplify/data/resource.ts`. This ensures your generated code is always in sync with your schema.

