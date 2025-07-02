## AWS Roark
Front end webapp repository for Perkins News Service. Back-end in AWS Lambda fetches, processes and stores news articles in dynambodb. The articles are distributed to varios channels (whatsapp, telegram) and to this webapp via AppSync subscriptions or long-polling.

## User Settings - to be improved
- Change password
- Delete account
- Subscription Details

## ToDo's
- Apply modified text
- Lucide Icons
- Implement "Search Bar" functionality

- Invite friends, establish rule to keep 3 months free for each friend
- Track user activity
- Pay suscription
- Custom domain
- Internationalization

- Create interface to deliver different content  - publicity, financials, etc - fix on top, colors, etc.

## CLI
https://docs.amplify.aws/react/reference/cli-commands/

- npm run dev : local client-side development

- npx amplify sandbox : deploys to backend sandbox
    > redeploys new schema on changes on files in amplify/ folder
    > updates local amplify_outputs.json
    > //?// need to add aws-exports.js to amplify_outputs.json when deploying to AWS

- npx ampx generate graphql-client-code --format graphql-codegen --out ./src/graphql/ 
    > generates API.ts, and graphql files based on local schema and amplify_outputs.json

- npx @aws-amplify/cli codegen 
    > downloads schema from the server
    > updates src/API.ts and graphql/files


howard > 
    sends full description, content as one text variable
    sends country codes ("Qs") as value pairs with their respective character index in text, chloc -1 if country in source definition

roark > calculates text to display
    if any of user country selected in country codes list with index -1, display first 200 characters

