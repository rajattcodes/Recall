# Clean Prisma Client directory
# Run this if you get "doesn't look like a generated Prisma Client" error

$prismaClientPath = "node_modules\.prisma\client"

if (Test-Path $prismaClientPath) {
    Write-Host "Removing existing Prisma Client directory..." -ForegroundColor Yellow
    Remove-Item -Path $prismaClientPath -Recurse -Force
    Write-Host "✅ Removed $prismaClientPath" -ForegroundColor Green
} else {
    Write-Host "✅ Prisma Client directory doesn't exist (already clean)" -ForegroundColor Green
}

Write-Host "`nNow run: npm run db:generate" -ForegroundColor Cyan
