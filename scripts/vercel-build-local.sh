#!/bin/bash

set -e

echo "🚀 Mimicking Vercel Build Process Locally"
echo "=========================================="
echo ""

cd "$(dirname "$0")/.."

echo "📦 Step 1: Clean install dependencies"
echo "--------------------------------------"
if [ -f "package-lock.json" ]; then
  echo "Found package-lock.json, using npm ci (like Vercel)"
  rm -rf node_modules
  npm ci
else
  echo "No package-lock.json, using npm install"
  rm -rf node_modules
  npm install
fi
echo "✅ Dependencies installed"
echo ""

echo "🏗️  Step 2: Build (exact Vercel command)"
echo "----------------------------------------"
echo "Running: npm run build"
echo "Which executes: prisma generate && next build"
echo ""
export NODE_ENV=production
npm run build
echo "✅ Build completed"
echo ""

echo "🚀 Step 3: Start production server"
echo "-----------------------------------"
echo "Running: npm start"
echo "Which executes: next start"
echo ""
echo "Server will start on http://localhost:3000"
echo "Press Ctrl+C to stop"
echo ""
npm start
