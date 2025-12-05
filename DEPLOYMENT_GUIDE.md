# SES Bounce Handling - Deployment Guide

## 🎯 Overview

This guide walks you through deploying the SES bounce handling solution step-by-step.

**Time Required**: ~20 minutes  
**Difficulty**: Easy (mostly AWS Console clicks)  
**Risk**: Low (non-breaking changes)

---

## ✅ Pre-Deployment Checklist

Before starting, verify:

- [x] ✅ Code review completed
- [x] ✅ Build passes (`npm run build`)
- [x] ✅ All files committed to Git
- [ ] 📋 AWS Console access
- [ ] 📋 SES sender email verified (`info@perkinsintel.com`)

---

## 📦 Step 1: Commit and Deploy Code Changes

### 1.1 Review Changes

Check what will be deployed:

```bash
git status
```

**Expected files:**
- `amplify/backend.ts` (modified)
- `amplify/functions/ses-campaign-sender/handler.ts` (modified)
- `amplify/functions/ses-bounce-handler/handler.ts` (new)
- `amplify/functions/ses-bounce-handler/resource.ts` (new)
- `documentation/SES_BOUNCE_HANDLING.md` (new)
- `documentation/MULTI_BRANCH_BOUNCE_HANDLING.md` (new)
- `SOLUTION_REVIEW_SUMMARY.md` (new)

### 1.2 Commit Changes

```bash
git add .
git commit -m "Add SES bounce handling with multi-branch support

- Add email tags to track branch/table origin
- Implement bounce handler Lambda with SNS integration
- Add input validation and error handling
- Support multi-branch deployments
- Add comprehensive documentation"
```

### 1.3 Push to Dev Branch

```bash
git push origin dev
```

### 1.4 Monitor Deployment

1. Go to **AWS Amplify Console**
2. Select your app → **dev** branch
3. Watch the deployment progress:
   - ⏳ **Backend**: Building... (5-10 minutes)
   - ⏳ **Frontend**: Building... (2-3 minutes)
4. Wait for: ✅ **Deploy succeeded**

**Expected Result:**
- New Lambda function: `ses-bounce-handler-dev-{hash}`
- Updated Lambda function: `ses-campaign-sender-dev-{hash}` (with tags)

---

## 🔔 Step 2: Create SNS Topics (One-Time Setup)

### 2.1 Create Bounce Topic

1. Go to **AWS SNS Console**: https://console.aws.amazon.com/sns/
2. Click **Topics** → **Create topic**
3. Configure:
   - **Type**: Standard
   - **Name**: `ses-bounces`
   - **Display name**: `SES Bounce Notifications`
4. Click **Create topic**
5. **Copy the ARN** (you'll need it later)

### 2.2 Create Complaint Topic

1. Click **Create topic** again
2. Configure:
   - **Type**: Standard
   - **Name**: `ses-complaints`
   - **Display name**: `SES Complaint Notifications`
3. Click **Create topic**
4. **Copy the ARN**

**Result**: Two SNS topics created ✅

---

## 📧 Step 3: Configure SES Notifications (One-Time Setup)

### 3.1 Navigate to SES

1. Go to **AWS SES Console**: https://console.aws.amazon.com/ses/
2. Click **Verified identities** (left sidebar)
3. Click on **info@perkinsintel.com**

### 3.2 Configure Bounce Notifications

1. Scroll to **Notifications** section
2. Click **Edit** next to "Bounce feedback"
3. Configure:
   - **SNS topic**: Select `ses-bounces`
   - **Include original headers**: ✅ Checked (optional but helpful)
4. Click **Save changes**

### 3.3 Configure Complaint Notifications

1. Click **Edit** next to "Complaint feedback"
2. Configure:
   - **SNS topic**: Select `ses-complaints`
   - **Include original headers**: ✅ Checked
3. Click **Save changes**

**Result**: SES will now publish to SNS topics ✅

---

## 🔗 Step 4: Subscribe Lambda to SNS Topics

### 4.1 Subscribe to Bounce Topic

1. Go back to **SNS Console** → **Topics**
2. Click on **ses-bounces**
3. Click **Create subscription**
4. Configure:
   - **Protocol**: AWS Lambda
   - **Endpoint**: Select `ses-bounce-handler-dev-{hash}`
   - Leave other settings as default
5. Click **Create subscription**

**Status should show**: ✅ Confirmed (automatic for Lambda)

### 4.2 Subscribe to Complaint Topic

1. Click **Topics** → **ses-complaints**
2. Click **Create subscription**
3. Configure:
   - **Protocol**: AWS Lambda
   - **Endpoint**: Select `ses-bounce-handler-dev-{hash}`
4. Click **Create subscription**

**Result**: Lambda subscribed to both topics ✅

---

## 🧪 Step 5: Test with SES Simulator

### 5.1 Get Function URL

1. Go to **AWS Lambda Console**
2. Find function: `ses-campaign-sender-dev-{hash}`
3. Go to **Configuration** → **Function URL**
4. Copy the URL (looks like: `https://abc123.lambda-url.us-east-1.on.aws/`)

### 5.2 Send Test Bounce Email

Open PowerShell and run:

```powershell
# Test hard bounce (permanent failure)
Invoke-RestMethod -Uri "https://YOUR-FUNCTION-URL" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"testEmail": "bounce@simulator.amazonses.com", "firstName": "Test"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Test email sent successfully to bounce@simulator.amazonses.com"
}
```

### 5.3 Wait for Bounce (1-2 minutes)

The bounce will happen asynchronously:
1. SES accepts email ✅
2. SES simulates bounce (30-60 seconds)
3. SES publishes to SNS
4. Lambda processes bounce
5. DynamoDB updated

### 5.4 Verify in CloudWatch Logs

1. Go to **CloudWatch Console** → **Log groups**
2. Find: `/aws/lambda/ses-bounce-handler-dev-{hash}`
3. Click on latest log stream
4. Look for:

```
Processing Permanent bounce with 1 recipients for table: SESCampaignContact-dev-{hash}
✅ Marked bounce@simulator.amazonses.com as bounced in table SESCampaignContact-dev-{hash}
```

### 5.5 Verify in DynamoDB

1. Go to **DynamoDB Console** → **Tables**
2. Find: `SESCampaignContact-dev-{hash}`
3. Click **Explore table items**
4. Search for: `bounce@simulator.amazonses.com`
5. Verify fields:
   - `Sent_Status`: `"true"` ✅
   - `Error_Status`: `"PERMANENT_FAILURE: Permanent - ..."` ✅

---

## 🎉 Step 6: Verify in Analytics Dashboard

### 6.1 Access Dashboard

1. Open your app: `https://dev.d{hash}.amplifyapp.com`
2. Log in as master user
3. Navigate to **Analytics Dashboard**

### 6.2 Check SES Metrics

Scroll to **SES Campaign Metrics** section:

**Before bounce:**
- Total Contacts: 1
- Contacts Sent: 1
- Contacts With Errors: 0

**After bounce (refresh page):**
- Total Contacts: 1
- Contacts Sent: 1
- Contacts With Errors: 1 ✅
- Permanent Failures: 1 ✅

---

## 🧪 Step 7: Test Other Scenarios (Optional)

### Test Soft Bounce (Temporary)

```powershell
Invoke-RestMethod -Uri "https://YOUR-FUNCTION-URL" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"testEmail": "ooto@simulator.amazonses.com", "firstName": "Test"}'
```

**Expected**: `Error_Status` set but `Sent_Status` remains `"false"` (will retry)

### Test Complaint (Spam)

```powershell
Invoke-RestMethod -Uri "https://YOUR-FUNCTION-URL" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"testEmail": "complaint@simulator.amazonses.com", "firstName": "Test"}'
```

**Expected**: `Error_Status` = `"PERMANENT_FAILURE: Complaint"`, `Sent_Status` = `"true"`

---

## 🚀 Step 8: Deploy to Main Branch (Optional)

Once verified in dev:

### 8.1 Merge to Main

```bash
git checkout main
git merge dev
git push origin main
```

### 8.2 Wait for Deployment

Monitor in Amplify Console (5-10 minutes)

### 8.3 Repeat SNS Subscription

**Important**: Subscribe the **main** branch Lambda to SNS topics:

1. SNS Console → **ses-bounces** → Create subscription
2. Select `ses-bounce-handler-main-{hash}`
3. Repeat for **ses-complaints**

**Why?** Each branch has its own Lambda function that needs to subscribe.

---

## ✅ Deployment Complete!

### What's Now Working

- ✅ Emails tagged with table name
- ✅ Bounces detected and stored
- ✅ Complaints tracked
- ✅ Analytics dashboard shows accurate metrics
- ✅ Multi-branch support active
- ✅ Automatic invalid email cleanup

### Monitoring

**CloudWatch Logs:**
- `/aws/lambda/ses-bounce-handler-dev-{hash}` - Bounce processing logs
- `/aws/lambda/ses-campaign-sender-dev-{hash}` - Email sending logs

**DynamoDB:**
- Check `Error_Status` field for bounce/complaint details
- `Sent_Status = "true"` + `Error_Status` starting with `"PERMANENT_FAILURE:"` = won't retry

**Analytics Dashboard:**
- Real-time bounce metrics
- Permanent vs temporary failure breakdown
- Per-branch isolated metrics

---

## 🔧 Troubleshooting

### Issue: Lambda Not Receiving Bounces

**Check:**
1. SNS subscription status (should be "Confirmed")
2. Lambda has permission to be invoked by SNS
3. SES notifications configured correctly

**Fix:**
```bash
# Verify SNS subscription
aws sns list-subscriptions-by-topic --topic-arn arn:aws:sns:us-east-1:ACCOUNT:ses-bounces
```

### Issue: DynamoDB Not Updating

**Check CloudWatch logs for:**
- `ConditionalCheckFailedException` → Email doesn't exist in table
- `AccessDeniedException` → IAM permissions issue

**Fix:**
- Verify IAM permissions in `amplify/backend.ts`
- Check table name validation in logs

### Issue: Wrong Table Being Updated

**Check:**
- Email tags in CloudWatch logs
- Table name validation warnings

**Fix:**
- Verify `CONTACT_TABLE_NAME` environment variable
- Check email tags are being added correctly

---

## 📊 Success Metrics

After 1 week of operation, you should see:

- **Bounce Rate**: < 5% (healthy)
- **Complaint Rate**: < 0.1% (healthy)
- **Permanent Failures**: Automatically excluded from future sends
- **Temporary Failures**: Retried automatically

---

## 🎯 Next Steps

1. ✅ Monitor for 1 week in dev
2. ✅ Deploy to main branch
3. ✅ Import full contact list (1,320 emails)
4. ✅ Monitor bounce rates
5. ✅ Clean up invalid emails
6. ✅ Adjust send limits based on bounce rates

---

## 📚 Additional Resources

- **Full Setup Guide**: `documentation/SES_BOUNCE_HANDLING.md`
- **Multi-Branch Strategy**: `documentation/MULTI_BRANCH_BOUNCE_HANDLING.md`
- **Solution Review**: `SOLUTION_REVIEW_SUMMARY.md`

---

## ✅ Deployment Checklist

- [ ] Step 1: Code deployed to dev branch
- [ ] Step 2: SNS topics created
- [ ] Step 3: SES notifications configured
- [ ] Step 4: Lambda subscribed to SNS
- [ ] Step 5: Test email sent
- [ ] Step 5: Bounce verified in CloudWatch
- [ ] Step 5: DynamoDB updated correctly
- [ ] Step 6: Analytics dashboard shows metrics
- [ ] Step 7: (Optional) Additional tests passed
- [ ] Step 8: (Optional) Deployed to main branch

**All done? 🎉 Your bounce handling is live!**

