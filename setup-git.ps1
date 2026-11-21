Write-Host "Initializing Git Repository for Next.js POS System..." -ForegroundColor Cyan
git init
git branch -M main
git add .
git commit -m "Initial commit: Next.js POS System with Tailwind CSS and Prisma"
Write-Host "Git repository initialized successfully!" -ForegroundColor Green
Read-Host "Press Enter to exit"
