## AWS Roark
Front end webapp repository for Perkins News Service. Back-end in AWS Lambda fetches, processes and stores news articles in dynambodb. The articles are distributed to varios channels (whatsapp, telegram) and to this webapp via AppSync subscriptions or long-polling.

## ToDo's
- Migrate email from Zoho to AWS Workmail
- Platform for original content publishers (CGI) self-service.
- Follow companies

- Platform for publicity self-service
- Implement subscription workflow. Use MPago account.
- Native IOS / Android App

## Notes
- Front-end local instance: npm run dev
- **GraphQL Code Generation (Amplify Gen 2):**
  - After schema changes in `amplify/data/resource.ts`, run: `npx ampx generate graphql-client-code --format graphql-codegen --out ./src/graphql/`
  - This generates TypeScript types and GraphQL queries in `src/graphql/` (API.ts, queries.ts, mutations.ts, subscriptions.ts)
  - **DO NOT** use `npx @aws-amplify/cli codegen` - it's for Amplify Gen 1 only
  - After generation, commit and push changes
- When adding a new branch, need to create GRAPHQL_API_KEY and GRAPHQL_API_URL manually on AWS Systems Manager > Parameter Store

## Deploy to PROD - merge dev into main
        1. git checkout main
        2. git merge dev [or branch name]
        3. git push origin main

## Tests
- Login / Logout
- Inactivity logout
- First time login instructions
- Referrals
- Access days left - dynamic getting close to cero on days
- Deleted emails


Take enough time to analyze the problem in detail, speed is not a priority. Then design a solution that:
1. Is robust yet concise and simple
2. Is secure and maintainable
3. Best Practice: Aligns with AWS and Amplify Gen 2 recommendations
4. Follows Codebase Patterns: Consistent with existing code style
5. Maintains consistency with our error handling approach
6. Checks for Typescript and AWS build errors.

Please explain your approach before showing code.