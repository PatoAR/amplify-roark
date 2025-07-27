## AWS Roark
Front end webapp repository for Perkins News Service. Back-end in AWS Lambda fetches, processes and stores news articles in dynambodb. The articles are distributed to varios channels (whatsapp, telegram) and to this webapp via AppSync subscriptions or long-polling.

## ToDo's
- Referral process not working
    - When user receives invite, after clicking link direct to sign-up page and have email filled in

- Implement split screen as suggested by ChatGPT
- Articles may not be real time warning
- Lucide icons to industry display on articles
- Global news button
- Add email with custom domain

- Modified display text
- Create interface to deliver different content  - publicity, financials, etc - fix on top, colors, etc.
- Open AWS account on the name of Finu, transfer domain 
- Pay suscription


## CI/CD

# PROD - AWS

# DEV - AWS

# DEV - LOCAL
    - Font-end development
        Work on DEV branch
        Test changes with npm run dev
        Run: git commit/push
        Merge into main (will redeploy PROD?)
    - Back-end development





## CLI
https://docs.amplify.aws/react/reference/cli-commands/

1. Run: git commit/push
2. Download amplify_outpust.json from AWS
3. Run: npx ampx generate graphql-client-code --format graphql-codegen --out ./src/graphql/ 
    > generate API.ts, and graphql files based on local schema and amplify_outputs.json


- npm run dev : local client-side development

- npx amplify sandbox : deploys to backend sandbox
    > redeploys new schema on changes on files in amplify/folder
    > updates local amplify_outputs.json

- npx ampx generate graphql-client-code --format graphql-codegen --out ./src/graphql/ 
    > generates API.ts, and graphql files based on local schema and amplify_outputs.json

- npx @aws-amplify/cli codegen 
    > downloads schema from the server
    > updates src/API.ts and graphql/files

