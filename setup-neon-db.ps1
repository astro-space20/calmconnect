# Simple Neon Database Setup for CalmConnect

Write-Host "🗄️ Setting up Neon Database for CalmConnect" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Steps to set up Neon Database:" -ForegroundColor Yellow
Write-Host "1. Go to https://neon.tech"
Write-Host "2. Sign up for a free account"
Write-Host "3. Create a new project"
Write-Host "4. Copy the connection string"
Write-Host ""

Write-Host "🔗 Your connection string will look like:" -ForegroundColor Cyan
Write-Host "postgresql://username:password@ep-xxx-xxx-xxx.region.aws.neon.tech/database"
Write-Host ""

$databaseUrl = Read-Host "Enter your Neon database URL"

if ($databaseUrl) {
    Write-Host ""
    Write-Host "🔧 Setting up environment variables..." -ForegroundColor Yellow
    
    # Generate secure secrets
    $jwtSecret = -join ((33..126) | Get-Random -Count 32 | ForEach-Object {[char]$_})
    $phoneKey = -join ((33..126) | Get-Random -Count 32 | ForEach-Object {[char]$_})
    
    # Update Cloud Run service with environment variables
    Write-Host "📤 Updating Cloud Run service..." -ForegroundColor Yellow
    gcloud run services update calmconnect --region=asia-south1 --set-env-vars "DATABASE_URL=$databaseUrl,JWT_SECRET=$jwtSecret,PHONE_ENCRYPTION_KEY=$phoneKey,GEMINI_API_KEY=temp-gemini-key,GOOGLE_CLIENT_ID=temp-google-client-id,GOOGLE_CLIENT_SECRET=temp-google-client-secret,NODE_ENV=production"
    
    Write-Host ""
    Write-Host "✅ Database setup completed!" -ForegroundColor Green
    Write-Host "🔐 Generated secure secrets for JWT and phone encryption"
    Write-Host ""
    Write-Host "📝 Next steps:" -ForegroundColor Yellow
    Write-Host "1. Run: npm run db:push (to set up database schema)"
    Write-Host "2. Configure external services (Twilio, Google OAuth, etc.)"
    Write-Host "3. Test your application"
} else {
    Write-Host "❌ No database URL provided. Setup cancelled." -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Setup complete!" -ForegroundColor Green
