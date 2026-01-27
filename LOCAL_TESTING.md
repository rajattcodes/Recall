# Local Testing Guide

Test the Prisma setup locally before deploying to Vercel.

## Quick Test Steps

### 1. Generate Prisma Client

```bash
npm run db:generate
```

This runs `prisma generate` and creates the Prisma Client in `node_modules/.prisma/client`.

**Expected output:**
```
✔ Generated Prisma Client (6.19.2) to ./node_modules/.prisma/client in XXms
```

### 2. Verify Prisma Client Generated

Check that the generated files exist:

```bash
# Windows PowerShell
Test-Path node_modules\.prisma\client\index.js

# Git Bash / Linux / Mac
ls node_modules/.prisma/client/index.js
```

### 3. Test TypeScript Compilation

Verify TypeScript can resolve the import:

```bash
npx tsc --noEmit
```

This checks for TypeScript errors without generating files. Should complete without errors.

### 4. Test Production Build

This is the most important test - simulates what Vercel does:

```bash
npm run build
```

**What this does:**
- Runs `postinstall` script (which runs `prisma generate`)
- Runs `next build` (Next.js production build)
- Verifies all imports resolve correctly

**Expected output:**
```
> recall@0.1.0 postinstall
> prisma generate

✔ Generated Prisma Client (6.19.2) to ./node_modules/.prisma/client in XXms

> recall@0.1.0 build
> next build

▲ Next.js 16.1.4
  Creating an optimized production build ...
  ✓ Compiled successfully
  ...
```

**If you see errors:**
- `Module not found: Can't resolve '@prisma/client'` → Prisma Client not generated
- `Module not found: Can't resolve '../app/generated/prisma'` → Old import path still exists
- Any other errors → Check the error message and fix accordingly

### 5. Test Development Server

Start the dev server to verify everything works:

```bash
npm run dev
```

Then visit `http://localhost:3000` and test:
- Page loads without errors
- No console errors about Prisma Client
- API routes work (if you have any)

### 6. Test Prisma Client Directly (Optional)

Create a quick test script to verify Prisma Client works:

```typescript
// test-prisma.ts (temporary file)
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function test() {
  try {
    // Test connection (doesn't require any tables)
    await prisma.$connect();
    console.log("✅ Prisma Client connected successfully!");
    
    // Test a simple query (adjust based on your schema)
    const count = await prisma.canonicalPattern.count();
    console.log(`✅ Found ${count} canonical patterns`);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
```

Run it:
```bash
tsx test-prisma.ts
```

Then delete the test file:
```bash
rm test-prisma.ts  # or del test-prisma.ts on Windows
```

## Troubleshooting

### Issue: "Module not found: Can't resolve '@prisma/client'"

**Solution:**
1. Make sure Prisma Client is generated: `npm run db:generate`
2. Check `node_modules/.prisma/client` exists
3. Verify `@prisma/client` package is installed: `npm list @prisma/client`

### Issue: "An output path is required"

**Solution:**
- Make sure `prisma/schema.prisma` has:
  ```prisma
  generator client {
    provider = "prisma-client"
    output   = "../node_modules/.prisma/client"
  }
  ```

### Issue: "doesn't look like a generated Prisma Client"

**Solution:**
The directory exists but is corrupted. Remove it and regenerate:

**Windows PowerShell:**
```powershell
Remove-Item -Path node_modules\.prisma\client -Recurse -Force
npm run db:generate
```

**Or use the cleanup script:**
```powershell
.\scripts\clean-prisma.ps1
npm run db:generate
```

**Git Bash / Linux / Mac:**
```bash
rm -rf node_modules/.prisma/client
npm run db:generate
```

### Issue: Build succeeds but dev server fails

**Solution:**
- Stop the dev server (`Ctrl+C`)
- Regenerate Prisma Client: `npm run db:generate`
- Restart dev server: `npm run dev`

### Issue: TypeScript errors about Prisma types

**Solution:**
- Regenerate Prisma Client: `npm run db:generate`
- Restart TypeScript server in your IDE
- If using VS Code: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

## Pre-Deployment Checklist

Before pushing to Vercel, verify:

- [ ] `npm run db:generate` completes without errors
- [ ] `npm run build` completes successfully
- [ ] `npx tsc --noEmit` shows no TypeScript errors
- [ ] Dev server starts without errors (`npm run dev`)
- [ ] No console errors about missing Prisma Client
- [ ] API routes work (if applicable)

## What Happens on Vercel

When you deploy to Vercel:

1. **`npm install`** runs
   - Installs all dependencies
   - Triggers `postinstall` script
   - Runs `prisma generate` automatically

2. **`npm run build`** runs
   - Next.js builds the application
   - Imports `@prisma/client` which resolves to generated client
   - Should succeed if local build succeeds

## Quick Test Command

Run this single command to test everything:

```bash
npm run db:generate && npm run build
```

If this succeeds locally, Vercel deployment should work too!
