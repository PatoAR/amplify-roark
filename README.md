## AWS Roark
Front end webapp repository for Perkins News Service. Back-end in AWS Lambda fetches, processes and stores news articles in dynambodb. The articles are distributed to varios channels (whatsapp, telegram) and to this webapp via AppSync subscriptions or long-polling.

## ToDo's
- Create interface to deliver different content  - publicity, financials, etc - fix on top, colors, etc.
- Modified display text
- Open AWS account on the name of Finu, transfer domain 
- Pay suscription

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


# Modified text
howard > 
    sends full description, content as one text variable
    sends country codes ("Qs") as value pairs with their respective character index in text, chloc -1 if country in source definition

roark > calculates text to display
    if any of user country selected in country codes list with index -1, display first 200 characters


# GoDaddy DNS
ns43.domaincontrol.com
ns44.domaincontrol.com