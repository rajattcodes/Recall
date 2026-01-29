# Mimic Vercel Build Process Locally (PowerShell)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Mimicking Vercel Build Process Locally" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Join-Path $scriptPath ".."
Set-Location $projectRoot

Write-Host "📦 Step 1: Clean install dependencies" -ForegroundColor Yellow
Write-Host "--------------------------------------" -ForegroundColor Yellow
if (Test-Path "package-lock.json") {
    Write-Host "Found package-lock.json, using npm ci (like Vercel)" -ForegroundColor Green
    Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
    npm ci
} else {
    Write-Host "No package-lock.json, using npm install" -ForegroundColor Green
    Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
    npm install
}
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

Write-Host "🏗️  Step 2: Build (exact Vercel command)" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Yellow
Write-Host "Running: npm run build" -ForegroundColor Gray
Write-Host "Which executes: prisma generate && next build" -ForegroundColor Gray
Write-Host ""
$env:NODE_ENV = "production"
npm run build
Write-Host "✅ Build completed" -ForegroundColor Green
Write-Host ""

Write-Host "🚀 Step 3: Start production server" -ForegroundColor Yellow
Write-Host "-----------------------------------" -ForegroundColor Yellow
Write-Host "Running: npm start" -ForegroundColor Gray
Write-Host "Which executes: next start" -ForegroundColor Gray
Write-Host ""
Write-Host "Server will start on http://localhost:3000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host ""
npm start
