# Deployment Checklist

Use this checklist to verify your RecallForge app is ready for production deployment.

## Pre-Deployment Checks

### 1. Environment Variables

- [ ] **DATABASE_URL** - PostgreSQL connection string configured
  - [ ] Connection string uses SSL (`?sslmode=require`)
  - [ ] Database is accessible from production environment
  - [ ] Connection pool limits configured appropriately

- [ ] **BETTER_AUTH_SECRET** - Authentication secret set
  - [ ] Generated with `openssl rand -base64 32`
  - [ ] Unique secret (not shared with development)
  - [ ] Stored securely in deployment platform

- [ ] **BETTER_AUTH_URL** - Server-side auth URL
  - [ ] Set to production domain (e.g., `https://yourdomain.com`)
  - [ ] No trailing slash
  - [ ] HTTPS enabled

- [ ] **NEXT_PUBLIC_BETTER_AUTH_URL** - Client-side auth URL
  - [ ] Set to production domain (e.g., `https://yourdomain.com`)
  - [ ] Matches `BETTER_AUTH_URL`
  - [ ] HTTPS enabled

- [ ] **RESEND_API_KEY** (Optional - for email digests)
  - [ ] API key created in Resend dashboard
  - [ ] Domain verified in Resend (if using custom domain)
  - [ ] Test email sent successfully

- [ ] **RESEND_FROM_EMAIL** (Optional - for email digests)
  - [ ] Email address verified in Resend
  - [ ] Or using `onboarding@resend.dev` for testing

- [ ] **CRON_SECRET** (Optional - for cron jobs)
  - [ ] Generated with `openssl rand -base64 32`
  - [ ] Matches secret used in Vercel cron configuration

### 2. Database Setup

- [ ] **Migrations Applied**
  - [ ] All migrations run: `npx prisma migrate deploy`
  - [ ] Database schema matches `prisma/schema.prisma`
  - [ ] No pending migrations

- [ ] **Canonical Patterns Seeded**
  - [ ] Seed script run: `npm run db:seed`
  - [ ] Verify 25+ patterns exist in database
  - [ ] Pattern names and descriptions correct

- [ ] **Database Indexes**
  - [ ] Indexes created (`problems_user_id_next_reminder_date_idx`, etc.)
  - [ ] Query performance acceptable

- [ ] **Connection Pooling**
  - [ ] Connection pool configured (if using PgBouncer or similar)
  - [ ] Pool size appropriate for expected load

### 3. Build & Compilation

- [ ] **Production Build**
  - [ ] `npm run build` completes without errors
  - [ ] No TypeScript errors
  - [ ] No ESLint errors blocking build
  - [ ] Build output size reasonable

- [ ] **Prisma Client Generated**
  - [ ] `npx prisma generate` run successfully
  - [ ] Generated client matches schema
  - [ ] Client included in build output

- [ ] **Dependencies**
  - [ ] All dependencies installed (`npm install`)
  - [ ] No security vulnerabilities (`npm audit`)
  - [ ] Production dependencies only (no dev dependencies)

### 4. Security

- [ ] **Authentication**
  - [ ] Better Auth configured correctly
  - [ ] Session expiration set appropriately (7 days)
  - [ ] Password hashing enabled
  - [ ] Email verification considered (currently disabled)

- [ ] **API Security**
  - [ ] All API routes require authentication
  - [ ] User ownership verified on all mutations
  - [ ] Input validation on all endpoints (Zod schemas)
  - [ ] SQL injection protection (Prisma parameterized queries)

- [ ] **Environment Variables**
  - [ ] No secrets committed to git
  - [ ] `.env` file in `.gitignore`
  - [ ] All secrets stored in deployment platform

- [ ] **CORS & Trusted Origins**
  - [ ] `trustedOrigins` configured in `lib/auth.ts`
  - [ ] Production domain added to trusted origins
  - [ ] No wildcard origins in production

### 5. Error Handling

- [ ] **Error Logging**
  - [ ] Error logger configured (`lib/error-logger.ts`)
  - [ ] Errors logged appropriately
  - [ ] Error monitoring service configured (optional: Sentry, etc.)

- [ ] **API Error Responses**
  - [ ] Consistent error format across all endpoints
  - [ ] No sensitive information leaked in errors
  - [ ] Proper HTTP status codes

- [ ] **Client Error Handling**
  - [ ] Error boundaries configured
  - [ ] User-friendly error messages
  - [ ] Error page (`app/error.tsx`) tested

### 6. Feature Verification

- [ ] **Core Features**
  - [ ] User registration/login works
  - [ ] Add problem functionality works
  - [ ] Mark problem solved/failed works
  - [ ] Failure notes dialog appears and saves correctly
  - [ ] Failure notes display on problem cards
  - [ ] Spaced repetition scheduling works (3 → 10 → 30 days)
  - [ ] "Due Today" page shows correct problems
  - [ ] "Failed" section shows failed problems

- [ ] **State Machine**
  - [ ] Problem state transitions work correctly
  - [ ] Failed problems reset to day_3
  - [ ] Mastered problems excluded from "due today"
  - [ ] Reminder dates calculated correctly

- [ ] **Failure Notes Feature**
  - [ ] Notes only saved on failures (not solved)
  - [ ] Validation works (max 3 bullets, 15 words each)
  - [ ] Notes display when problems reappear
  - [ ] Previous notes preserved when failing again without notes
  - [ ] Defensive parsing handles invalid JSON gracefully

- [ ] **Email Digests** (if enabled)
  - [ ] Cron job configured in `vercel.json`
  - [ ] Daily digest endpoint works
  - [ ] Email sending tested
  - [ ] CRON_SECRET authentication works

### 7. Performance

- [ ] **Database Queries**
  - [ ] Queries optimized (no N+1 queries)
  - [ ] Indexes used appropriately
  - [ ] Connection pooling configured

- [ ] **API Response Times**
  - [ ] API endpoints respond quickly (< 500ms)
  - [ ] No unnecessary data fetching
  - [ ] Pagination considered (if needed)

- [ ] **Client Performance**
  - [ ] Page load times acceptable
  - [ ] No large bundle sizes
  - [ ] Images optimized (if any)
  - [ ] Code splitting working

### 8. Testing

- [ ] **Manual Testing**
  - [ ] User registration flow tested
  - [ ] Login/logout tested
  - [ ] Add problem tested
  - [ ] Mark solved/failed tested
  - [ ] Failure notes tested
  - [ ] Spaced repetition timing tested
  - [ ] All pages load correctly

- [ ] **Automated Tests** (if applicable)
  - [ ] Tests pass: `npm test`
  - [ ] Test coverage acceptable
  - [ ] CI/CD pipeline configured

- [ ] **Edge Cases**
  - [ ] Empty states handled
  - [ ] Invalid input handled
  - [ ] Network errors handled
  - [ ] Database connection errors handled

### 9. Deployment Platform (Vercel)

- [ ] **Project Configuration**
  - [ ] Project imported in Vercel
  - [ ] Build command: `npm run build`
  - [ ] Output directory: `.next`
  - [ ] Node.js version: 18+ (check `package.json`)

- [ ] **Environment Variables**
  - [ ] All environment variables added in Vercel dashboard
  - [ ] Variables set for production environment
  - [ ] No development values in production

- [ ] **Cron Jobs**
  - [ ] `vercel.json` configured correctly
  - [ ] Cron schedule: `0 8 * * *` (8 AM UTC daily)
  - [ ] Endpoint: `/api/cron/daily-digest`
  - [ ] CRON_SECRET authentication configured

- [ ] **Domain & SSL**
  - [ ] Custom domain configured (if applicable)
  - [ ] SSL certificate active
  - [ ] Domain verified in Better Auth trusted origins

### 10. Monitoring & Observability

- [ ] **Logging**
  - [ ] Application logs accessible
  - [ ] Error logs monitored
  - [ ] Database query logs reviewed (if needed)

- [ ] **Metrics** (Optional but recommended)
  - [ ] Uptime monitoring configured
  - [ ] Performance monitoring configured
  - [ ] Error tracking service configured (Sentry, etc.)

- [ ] **Alerts**
  - [ ] Critical error alerts configured
  - [ ] Database connection alerts configured
  - [ ] Deployment failure alerts configured

### 11. Documentation

- [ ] **README Updated**
  - [ ] Deployment instructions current
  - [ ] Environment variables documented
  - [ ] Database setup documented

- [ ] **API Documentation** (if applicable)
  - [ ] Endpoints documented
  - [ ] Request/response formats documented

### 12. Post-Deployment Verification

- [ ] **Smoke Tests**
  - [ ] Homepage loads
  - [ ] Registration works
  - [ ] Login works
  - [ ] Add problem works
  - [ ] Mark problem works
  - [ ] Failure notes work

- [ ] **Database Verification**
  - [ ] Database connection stable
  - [ ] Queries execute correctly
  - [ ] Data persists correctly

- [ ] **Email Verification** (if enabled)
  - [ ] Test email sent successfully
  - [ ] Cron job executes correctly
  - [ ] Daily digest emails sent

- [ ] **Performance Verification**
  - [ ] Page load times acceptable
  - [ ] API response times acceptable
  - [ ] No memory leaks
  - [ ] No excessive database connections

## Critical Items (Must Complete)

These items are **required** for a successful deployment:

1. ✅ All required environment variables set
2. ✅ Database migrations applied
3. ✅ Canonical patterns seeded
4. ✅ Production build succeeds
5. ✅ Authentication works
6. ✅ Core features work
7. ✅ Error handling configured
8. ✅ Security measures in place

## Optional Items (Recommended)

These items improve production readiness but aren't strictly required:

- Email digests (Resend)
- Cron jobs
- Error monitoring (Sentry)
- Performance monitoring
- Automated testing
- Custom domain

## Quick Pre-Deploy Commands

Run these commands before deploying:

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma client
npx prisma generate

# 3. Run linting
npm run lint

# 4. Build for production
npm run build

# 5. Verify build output
ls -la .next

# 6. Check for security vulnerabilities
npm audit

# 7. Test production build locally (optional)
npm run start
```

## Deployment Steps

1. **Push to Git**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Push triggers automatic deployment (if connected)
   - Or manually deploy from Vercel dashboard

3. **Verify Deployment**
   - Check deployment logs in Vercel
   - Verify all environment variables set
   - Test critical user flows

4. **Monitor**
   - Watch error logs for first 24 hours
   - Monitor database connections
   - Check cron job execution (if enabled)

## Rollback Plan

If deployment fails:

1. **Immediate Rollback**
   - Use Vercel's "Revert" button
   - Or redeploy previous working version

2. **Database Rollback** (if needed)
   - Restore database from backup
   - Or manually rollback migrations

3. **Environment Variables**
   - Verify all variables still set correctly
   - Check for typos or missing values

## Support & Troubleshooting

Common issues:

- **Build fails**: Check build logs, verify all dependencies installed
- **Database connection fails**: Verify DATABASE_URL, check SSL settings
- **Auth not working**: Verify BETTER_AUTH_URL matches deployment URL
- **Cron not running**: Verify CRON_SECRET matches, check vercel.json

For issues, check:
- Vercel deployment logs
- Database logs
- Application error logs
- Browser console (for client-side issues)
