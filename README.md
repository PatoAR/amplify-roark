## AWS Roark
Front end webapp repository for Perkins News Service. Back-end in AWS Lambda fetches, processes and stores news articles in dynambodb. The articles are distributed to varios channels (whatsapp, telegram) and to this webapp via AppSync subscriptions or long-polling.

## ToDo's
- Apply modified text

- Implement "Search Bar" functionality
- Lucide Icons
- Button for "all" news

- Custom domain
- Internationalization

- Pay suscription
- Create interface to deliver different content  - publicity, financials, etc - fix on top, colors, etc.

## 🎁 Referral System

The referral system is now fully implemented! Users can:

- **Generate unique referral codes** - Each user gets a unique 8-character code
- **Share via multiple platforms** - WhatsApp, Email, or copy link
- **Track statistics** - See successful referrals and earned months
- **Earn free months** - Get 3 additional months for each successful referral
- **URL-based signup** - Users can sign up using referral links

### How to Use

1. **For Referrers**: Visit Settings → "🎁 Invite Friends" tab
2. **For New Users**: Use referral code during signup or click referral links
3. **Business Logic**: 3 months initial + 3 months per referral (unlimited)

See `REFERRAL_SYSTEM.md` for complete technical documentation.

## 🎨 Design System

The application now features a **unified minimalistic design system** that provides:

- **Consistent visual hierarchy** with standardized typography and spacing
- **Clean, ascetic interfaces** with generous whitespace and subtle shadows
- **Accessibility-first approach** with proper contrast ratios and focus states
- **Mobile-responsive design** that works seamlessly across all devices
- **Smooth interactions** with purposeful animations and transitions

### Key Features

- **CSS Custom Properties** for consistent theming
- **Modular component architecture** for reusability
- **Performance-optimized animations** (60fps)
- **Accessibility compliance** with WCAG guidelines
- **Touch-friendly mobile experience**

See `UI_UX_GUIDELINES.md` for complete design system documentation.


## CLI
https://docs.amplify.aws/react/reference/cli-commands/

1. Run git commit/push
2. Download amplify_outpust.json from AWS 
3. Run npx ampx generate graphql-client-code --format graphql-codegen --out ./src/graphql/ 
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

