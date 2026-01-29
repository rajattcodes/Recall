# Mimic Vercel Build Locally

Commands to test the Vercel build process on your local machine.

## Prerequisites

1. **Set up environment variables** - Copy `.env.example` to `.env` and fill in values:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your actual values (DATABASE_URL, BETTER_AUTH_SECRET, etc.)

## Full Vercel Build Simulation

### Option 1: Clean Build (Recommended - Mimics Vercel exactly)

**If you have `package-lock.json`:**

```bash
# Navigate to project directory
cd recall

# Clean install (like Vercel does - removes node_modules and reinstalls)
rm -rf node_modules
npm ci

# Set production environment (optional, but recommended)
export NODE_ENV=production

# Run the build (same command Vercel runs)
npm run build

# Test production build locally
npm start
```

**Windows PowerShell (with package-lock.json):**
```powershell
cd recall
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
npm ci
$env:NODE_ENV="production"
npm run build
npm start
```

**If you DON'T have `package-lock.json` (use npm install instead):**

```bash
cd recall
rm -rf node_modules
npm install
export NODE_ENV=production
npm run build
npm start
```

**Windows PowerShell (without package-lock.json):**
```powershell
cd recall
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
npm install
$env:NODE_ENV="production"
npm run build
npm start
```

### Option 2: Quick Build Test (Without clean install)

```bash
cd recall
npm run build
npm start
```

## What Each Command Does

1. **`npm ci`** or **`npm install`** - Clean install
   - `npm ci` - Requires `package-lock.json`, installs exact versions (Vercel uses this)
   - `npm install` - Works without `package-lock.json`, installs dependencies
   - Both run `postinstall` script automatically (which runs `prisma generate`)

2. **`npm run build`** - Production build
   - Runs: `prisma generate && node scripts/fix-prisma-import.js && next build`
   - Generates Prisma Client
   - Fixes Prisma imports
   - Builds Next.js production bundle

3. **`npm start`** - Test production server
   - Starts Next.js production server on `http://localhost:3000`
   - Tests the built application

## Environment Variables

Make sure your `.env` file has all required variables:

```bash
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
RESEND_API_KEY=...
RESEND_FROM_EMAIL=...
CRON_SECRET=...
```

## Verify Build Success

After running `npm run build`, you should see:
- ✅ Prisma Client generated successfully
- ✅ Next.js compiled successfully
- ✅ Build output in `.next` directory

After running `npm start`, you should:
- ✅ Server starts on `http://localhost:3000`
- ✅ Pages load without errors
- ✅ No console errors about missing modules

## Troubleshooting

### Build fails with "Module not found: Can't resolve '@prisma/client'"
```bash
npm run db:generate
npm run build
```

### Build fails with Prisma errors
```bash
# Clean Prisma client
rm -rf node_modules/.prisma
# Windows: Remove-Item -Recurse -Force node_modules\.prisma

# Regenerate
npm run db:generate
npm run build
```

### TypeScript errors during build
```bash
npx tsc --noEmit
```
Fix any TypeScript errors before building.

## One-Liner Commands

**Full clean build (with package-lock.json):**
```bash
cd recall && rm -rf node_modules && npm ci && NODE_ENV=production npm run build && npm start
```

**Full clean build (without package-lock.json):**
```bash
cd recall && rm -rf node_modules && npm install && NODE_ENV=production npm run build && npm start
```

**Quick build test:**
```bash
cd recall && npm run build && npm start
```
