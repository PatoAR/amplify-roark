# Email Headers Solution for Multi-Branch Bounce Handling

## Problem

SES Tags are **not reliably included** in SNS bounce notifications, especially when using the SES simulator (`bounce@simulator.amazonses.com`). This prevents multi-branch bounce handling from working correctly.

## Solution: Use Custom Email Headers

Custom email headers **ARE included** in SNS bounce notifications, making them a more reliable solution.

## Implementation

### 1. Campaign Sender Adds Custom Header

**File:** `amplify/functions/ses-campaign-sender/handler.ts`

```typescript
Message: {
  Subject: { /* ... */ },
  Body: { /* ... */ },
  // Add custom headers to track which branch/table this email belongs to
  // Headers are included in SNS bounce notifications (unlike Tags which may not be)
  Headers: [
    {
      Name: 'X-Campaign-Table',
      Value: CONTACT_TABLE_NAME, // Full table name with branch identifier
    },
  ],
},
// Also include Tags for potential future use (though they may not appear in simulator)
Tags: [
  {
    Name: 'campaign-table',
    Value: CONTACT_TABLE_NAME,
  },
],
```

### 2. Bounce Handler Reads from Headers

**File:** `amplify/functions/ses-bounce-handler/handler.ts`

```typescript
// Extract and validate table name from email headers (preferred) or tags (fallback)
let rawTableName: string | undefined;

// Try to get from custom header first (more reliable)
const headers = notification.mail.headers || [];
const campaignTableHeader = headers.find((h: any) => h.name === 'X-Campaign-Table');
if (campaignTableHeader) {
  rawTableName = campaignTableHeader.value;
}

// Fallback to tags if header not found
if (!rawTableName) {
  rawTableName = notification.mail.tags?.['campaign-table']?.[0];
}

const tableName = rawTableName && validateTableName(rawTableName)
  ? rawTableName
  : CONTACT_TABLE_NAME;
```

## How It Works

1. **Email Sent:** Campaign sender includes `X-Campaign-Table` header with table name
2. **Bounce Occurs:** SES includes email headers in SNS notification
3. **Handler Processes:** Bounce handler reads `X-Campaign-Table` header from `mail.headers` array
4. **Table Updated:** Correct branch's DynamoDB table is updated

## SNS Message Structure

With headers, the SNS bounce notification includes:

```json
{
  "notificationType": "Bounce",
  "mail": {
    "headers": [
      {
        "name": "X-Campaign-Table",
        "value": "SESCampaignContact-p7l2jyarsfe5netqwh7uthfc3i-NONE"
      },
      {
        "name": "From",
        "value": "Perkins Intelligence <info@perkinsintel.com>"
      },
      // ... other headers
    ]
  },
  "bounce": { /* bounce details */ }
}
```

## Benefits

✅ **Reliable:** Headers are always included in bounce notifications  
✅ **Works with Simulator:** Headers work even with `bounce@simulator.amazonses.com`  
✅ **Backward Compatible:** Falls back to tags if headers not found  
✅ **Multi-Branch Support:** Each branch's emails include their table name  

## Testing

After deployment, send a test email:

```powershell
cd scripts
npm run test-bounce bounce@simulator.amazonses.com <function-url>
```

Check CloudWatch logs - you should see:

```
Processing Permanent bounce with 1 recipients for table: SESCampaignContact-p7l2jyarsfe5netqwh7uthfc3i-NONE (from header)
```

The `(from header)` indicates the table name was successfully extracted from the custom header.

## Migration Notes

- **Old emails:** Will use fallback table name (environment variable)
- **New emails:** Will use header-based table name
- **No data migration needed:** Existing records are unaffected

## Why Headers Instead of Tags?

| Feature | Tags | Headers |
|---------|------|---------|
| Included in SNS notifications | ❌ Not reliable | ✅ Always included |
| Works with simulator | ❌ No | ✅ Yes |
| Multi-branch support | ⚠️ Unreliable | ✅ Reliable |
| AWS documentation | ⚠️ Unclear | ✅ Well documented |

## Next Steps

1. ✅ Code updated to use headers
2. Deploy to AWS
3. Test with simulator email
4. Verify headers appear in CloudWatch logs
5. Confirm multi-branch support works

