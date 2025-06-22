## AWS Roark
Front end webapp repository for Perkins News Service. Back-end in AWS Lambda fetches, processes and stores news articles in dynambodb. The articles are distributed to varios channels (whatsapp, telegram) and to this webapp via AppSync subscriptions or long-polling.

## ToDo's
- Use only one const client = generateClient<Schema>();


## CLI
https://docs.amplify.aws/react/reference/cli-commands/

- npm run dev : local client-side development

- npx amplify sandbox : deploys to backend sandbox
    > redeploys on changes on files in amplify folder
    > updates amplify_outputs.json
    > need to add aws-exports.js to amplify_outputs.json when deploying to AWS

- npx ampx generate graphql-client-code --format graphql-codegen --out ./src/graphql/ 
    > generates API.ts, and graphql files based on local schema and amplify_outputs.json

- npx @aws-amplify/cli codegen 
    > downloads schema from the server
