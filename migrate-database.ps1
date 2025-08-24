# CalmConnect Database Migration Script
# This script helps set up and migrate the database for CalmConnect

Write-Host "🗄️ CalmConnect Database Migration" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""

# Check if we have a DATABASE_URL environment variable
$currentDbUrl = gcloud run services describe calmconnect --region=asia-south1 --format='value(spec.template.spec.containers[0].env[0].value)' 2>$null

if ($currentDbUrl -and $currentDbUrl -ne "postgresql://test:test@localhost/test") {
    Write-Host "✅ Found existing database URL" -ForegroundColor Green
    Write-Host "🔗 Database: $currentDbUrl" -ForegroundColor Cyan
} else {
    Write-Host "❌ No proper database URL found" -ForegroundColor Red
    Write-Host "Please run the database setup script first:" -ForegroundColor Yellow
    Write-Host ".\setup-neon-db.ps1" -ForegroundColor Cyan
    exit 1
}

Write-Host ""
Write-Host "📋 Database Schema Overview:" -ForegroundColor Yellow
Write-Host "• Users & Authentication" -ForegroundColor White
Write-Host "• Activities & Fitness Tracking" -ForegroundColor White
Write-Host "• Wearable Devices Integration" -ForegroundColor White
Write-Host "• Sleep & Heart Rate Data" -ForegroundColor White
Write-Host "• Nutrition Logging" -ForegroundColor White
Write-Host "• Social Exposure Tracking" -ForegroundColor White
Write-Host "• Thought Journaling (CBT)" -ForegroundColor White
Write-Host "• Empathy Check-ins" -ForegroundColor White
Write-Host "• Counselling System" -ForegroundColor White
Write-Host "• Achievements & Gamification" -ForegroundColor White
Write-Host ""

$confirm = Read-Host "Do you want to proceed with database migration? (y/n)"

if ($confirm -eq "y") {
    Write-Host ""
    Write-Host "🔧 Running database migration..." -ForegroundColor Yellow
    
    try {
        # Set the DATABASE_URL environment variable for the migration
        $env:DATABASE_URL = $currentDbUrl
        
        # Run the database migration
        Write-Host "📤 Pushing schema to database..." -ForegroundColor Yellow
        npm run db:push
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ Database migration completed successfully!" -ForegroundColor Green
            Write-Host ""
            Write-Host "📊 Database Tables Created:" -ForegroundColor Yellow
            Write-Host "• users" -ForegroundColor White
            Write-Host "• otp_codes" -ForegroundColor White
            Write-Host "• email_verification_codes" -ForegroundColor White
            Write-Host "• activities" -ForegroundColor White
            Write-Host "• wearable_devices" -ForegroundColor White
            Write-Host "• sleep_data" -ForegroundColor White
            Write-Host "• heart_rate_data" -ForegroundColor White
            Write-Host "• nutrition_logs" -ForegroundColor White
            Write-Host "• social_exposures" -ForegroundColor White
            Write-Host "• thought_journals" -ForegroundColor White
            Write-Host "• empathy_checkins" -ForegroundColor White
            Write-Host "• counsellors" -ForegroundColor White
            Write-Host "• counsellor_time_slots" -ForegroundColor White
            Write-Host "• counselling_bookings" -ForegroundColor White
            Write-Host "• achievements" -ForegroundColor White
            Write-Host ""
            Write-Host "🎉 Your CalmConnect application is now ready!" -ForegroundColor Green
            Write-Host "🌐 Application URL: https://calmconnect-675727563052.asia-south1.run.app" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "📝 Next Steps:" -ForegroundColor Yellow
            Write-Host "1. Test the application functionality"
            Write-Host "2. Set up external services (Twilio, Google OAuth, Gemini AI)"
            Write-Host "3. Configure real API keys and secrets"
            Write-Host "4. Add sample data if needed"
        } else {
            Write-Host "❌ Database migration failed!" -ForegroundColor Red
            Write-Host "Please check your database connection and try again." -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ Error during migration: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Migration cancelled." -ForegroundColor Red
}

Write-Host ""
Write-Host "🔗 For help with external services setup, see:" -ForegroundColor Yellow
Write-Host "• Twilio: https://www.twilio.com/docs/sms" -ForegroundColor Cyan
Write-Host "• Google OAuth: https://developers.google.com/identity/protocols/oauth2" -ForegroundColor Cyan
Write-Host "• Gemini AI: https://ai.google.dev/" -ForegroundColor Cyan
