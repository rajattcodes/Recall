# Resend Email Setup Guide

Complete guide for setting up Resend email service for daily digest emails.

## Current Implementation Status

✅ **Code Already Implemented:**
- Resend client configured (`lib/email.ts`)
- Daily digest email template (`lib/email.ts`)
- Cron endpoint (`app/api/cron/daily-digest/route.ts`)
- Vercel cron configuration (`vercel.json`)

## Step-by-Step Setup

### 1. Create Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### 2. Get API Key

1. Log into Resend dashboard
2. Navigate to **API Keys** section
3. Click **Create API Key**
4. Give it a name (e.g., "RecallForge Production")
5. Select permissions: **Sending access**
6. Copy the API key (starts with `re_...`)
7. **Important**: Save it immediately - you won't be able to see it again!

### 3. Verify Email Address (For Testing)

**Option A: Use Test Email (Quick Setup)**
- Use `onboarding@resend.dev` (no verification needed)
- Good for testing and development
- Limited to 100 emails/day

**Option B: Verify Your Domain (Production)**
1. Go to **Domains** in Resend dashboard
2. Click **Add Domain**
3. Enter your domain (e.g., `yourdomain.com`)
4. Add DNS records to your domain provider:
   - SPF record
   - DKIM records
   - DMARC record (optional but recommended)
5. Wait for verification (usually 5-15 minutes)
6. Use verified email: `noreply@yourdomain.com` or similar

### 4. Configure Environment Variables

Add these to your `.env` file (local) and Vercel (production):

```bash
# Resend API Key (from step 2)
RESEND_API_KEY=re_your_api_key_here

# From email address
# For testing: onboarding@resend.dev
# For production: your verified email (e.g., noreply@yourdomain.com)
RESEND_FROM_EMAIL=onboarding@resend.dev

# Cron secret (generate with: openssl rand -base64 32)
CRON_SECRET=your_cron_secret_here
```

### 5. Generate CRON_SECRET

If you haven't already, generate a cron secret:

```bash
openssl rand -base64 32
```

Copy the output and add it to your environment variables.

### 6. Test Locally

Test the email sending functionality:

```bash
# Start your dev server
npm run dev

# In another terminal, test the cron endpoint
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  "http://localhost:3000/api/cron/daily-digest"
```

**Expected Response:**
```json
{
  "success": true,
  "dueCount": 0,
  "failedCount": 0,
  "emailsSent": 0,
  "usersProcessed": 0,
  "message": "No users with problems found"
}
```

If you have users with problems, you should see emails sent.

### 7. Configure Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables for **Production**:
   - `RESEND_API_KEY` = Your Resend API key
   - `RESEND_FROM_EMAIL` = Your verified email
   - `CRON_SECRET` = Your generated cron secret

4. **Important**: Make sure to add them for **Production** environment (not Preview/Development)

### 8. Verify Cron Job Configuration

Check `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-digest",
      "schedule": "0 8 * * *"
    }
  ]
}
```

This runs daily at 8:00 AM UTC.

### 9. Test in Production

After deploying:

1. **Manual Test**:
   ```bash
   curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
     "https://yourdomain.com/api/cron/daily-digest"
   ```

2. **Check Vercel Cron Logs**:
   - Go to Vercel dashboard
   - Navigate to **Cron Jobs** section
   - Check execution logs
   - Verify emails are being sent

3. **Check Email Delivery**:
   - Check your inbox (or spam folder)
   - Verify email format looks correct
   - Test links in email work

## Email Template Features

The daily digest email includes:

- **Header**: RecallForge branding
- **Summary**: Total problems count (due + failed)
- **Due Today Section**: Problems grouped by pattern
- **Failed Section**: Failed problems needing attention
- **Call-to-Action**: Button linking to `/today` page

## Troubleshooting

### Emails Not Sending

1. **Check Environment Variables**:
   ```bash
   # Verify they're set
   echo $RESEND_API_KEY
   echo $RESEND_FROM_EMAIL
   ```

2. **Check Resend Dashboard**:
   - Go to **Logs** in Resend dashboard
   - Check for error messages
   - Verify API key is active

3. **Check Vercel Logs**:
   - Go to Vercel dashboard → **Deployments** → **Functions**
   - Check `/api/cron/daily-digest` logs
   - Look for error messages

### Common Issues

**Issue**: "RESEND_API_KEY environment variable is not set"
- **Solution**: Add `RESEND_API_KEY` to Vercel environment variables

**Issue**: "RESEND_FROM_EMAIL environment variable is not set"
- **Solution**: Add `RESEND_FROM_EMAIL` to Vercel environment variables

**Issue**: "Unauthorized" when calling cron endpoint
- **Solution**: Verify `CRON_SECRET` matches in request header and environment variable

**Issue**: Emails going to spam
- **Solution**: Verify your domain in Resend (not using `onboarding@resend.dev`)
- Add SPF/DKIM records
- Consider setting up DMARC

**Issue**: Cron job not running
- **Solution**: 
  - Verify `vercel.json` is committed to git
  - Check Vercel cron jobs dashboard
  - Ensure you're on a paid Vercel plan (cron jobs require paid plan)

### Testing Email Template

To preview the email template locally, you can create a test script:

```typescript
// test-email.ts (temporary test file)
import { sendDailyDigest } from "./lib/email";

async function test() {
  const result = await sendDailyDigest(
    "your-email@example.com",
    [
      {
        title: "Two Sum",
        leetcodeUrl: "https://leetcode.com/problems/two-sum",
        reminderStage: "day_3",
        canonicalPattern: { name: "Two Pointers" },
        customPattern: null,
      },
    ],
    [
      {
        title: "Valid Parentheses",
        leetcodeUrl: "https://leetcode.com/problems/valid-parentheses",
        failureCount: 2,
        canonicalPattern: { name: "Stack" },
        customPattern: null,
      },
    ]
  );
  console.log(result);
}

test();
```

Run with: `tsx test-email.ts`

## Production Checklist

Before going live:

- [ ] Resend API key created and added to Vercel
- [ ] Email address verified in Resend (or using `onboarding@resend.dev` for testing)
- [ ] `RESEND_FROM_EMAIL` set in Vercel
- [ ] `CRON_SECRET` generated and set in Vercel
- [ ] Cron endpoint tested manually
- [ ] Email received and verified
- [ ] Email template looks correct
- [ ] Links in email work correctly
- [ ] Domain verified (if using custom domain)
- [ ] DNS records added (if using custom domain)

## Email Limits

**Free Tier (onboarding@resend.dev)**:
- 100 emails/day
- Good for testing

**Paid Tier**:
- Starts at $20/month
- 50,000 emails/month
- Custom domain support
- Better deliverability

## Security Notes

1. **Never commit API keys to git**
2. **Use different API keys for dev/prod** (if possible)
3. **Rotate CRON_SECRET periodically**
4. **Monitor Resend dashboard for suspicious activity**
5. **Set up email rate limiting** (Resend handles this automatically)

## Next Steps

After setup:

1. Monitor first few cron executions
2. Check email deliverability rates
3. Gather user feedback on email format
4. Consider adding unsubscribe link (future enhancement)
5. Consider email preferences (future enhancement)

## Support

- Resend Docs: https://resend.com/docs
- Resend Support: support@resend.com
- Vercel Cron Docs: https://vercel.com/docs/cron-jobs
