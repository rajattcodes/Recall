# Mimic Vercel Build Locally

Commands and scripts to test the exact Vercel build process on your local machine.

## Quick Start

**Using npm scripts (easiest):**

```bash
# Bash/Git Bash
npm run vercel:build

# PowerShell
npm run vercel:build:ps1
```

**Or use the scripts directly:**

```bash
# Bash/Git Bash
bash scripts/vercel-build-local.sh

# PowerShell
powershell -ExecutionPolicy Bypass -File scripts/vercel-build-local.ps1
```

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

## Exact Vercel Build Process

The scripts mimic Vercel's exact build process:

1. **`npm ci`** or **`npm install`** - Clean install (Step 1)
   - `npm ci` - Requires `package-lock.json`, installs exact versions (Vercel uses this)
   - `npm install` - Works without `package-lock.json`, installs dependencies
   - Automatically triggers `postinstall` script → runs `fix-prisma-import.js`
   - Note: Prisma files don't exist yet, so this may do nothing

2. **`npm run build`** - Production build (Step 2)
   - Executes: `prisma generate && node scripts/fix-prisma-import.js && next build`
   - `prisma generate` - Generates Prisma Client to `app/generated/prisma`
   - `node scripts/fix-prisma-import.js` - Fixes import paths for Turbopack
   - `next build` - Builds Next.js production bundle

3. **`npm start`** - Test production server (Step 3)
   - Executes: `next start`
   - Starts Next.js production server on `http://localhost:3000`
   - Tests the built application

## What Each Command Does

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
