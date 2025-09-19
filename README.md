## AWS Roark
Front end webapp repository for Perkins News Service. Back-end in AWS Lambda fetches, processes and stores news articles in dynambodb. The articles are distributed to varios channels (whatsapp, telegram) and to this webapp via AppSync subscriptions or long-polling.

## ToDo's
- Access expired modal - showed up when i still have days
- Modified display text
- Open (MPago) business account for Finu - pay AWS, GEMINI.
- Open AWS account on the name of Finu, transfer domain 
- Implement subscription workflow. Use MPago account.
- Legal disclaimers

- Native IOS / Android App

## CI/CD

# DEV - LOCAL
    - Font-end local instance: npm run dev
    - Back-end sandbox: npx amplify sandbox
        > deploys schema on changes on files in amplify/folder
        > updates local amplify_outputs.json
        ?> Run: npx ampx generate graphql-client-code --format graphql-codegen --out ./src/graphql/ 
            >> generates API.ts, and graphql files based on local schema and amplify_outputs.json
    - Howard feed not connected - will not feed news to backend

# DEV - AWS
    - Git commit / push to deploy changes to AWS
    - To use "npm run dev" frontend with "DEV AWS" backend (if previously working with sandbox):
        > Download new amplify_outputs.json 
        > Run: npx ampx generate graphql-client-code --format graphql-codegen --out ./src/graphql/ 
            >> generates API.ts, and graphql files based on local schema and amplify_outputs.json 
        - npx @aws-amplify/cli codegen 
            >> downloads schema from the server
            >> updates src/API.ts and graphql/files

# PROD - AWS - merge dev into main
        git checkout main
        git merge appsync / dev
        git push origin main

## Tests
- Login / Logout
- First time login instructions
- Inactivity logout
- Referrals
- Access days left - dynamic getting close to cero on days
- Deleted emails
