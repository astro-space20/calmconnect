# Email Setup for CalmConnect

Write-Host "Email Setup for CalmConnect" -ForegroundColor Green
Write-Host "===========================" -ForegroundColor Green
Write-Host ""

Write-Host "This will help you set up Gmail to send verification emails." -ForegroundColor Yellow
Write-Host ""

Write-Host "Steps to set up Gmail App Password:" -ForegroundColor Cyan
Write-Host "1. Go to your Google Account settings" -ForegroundColor White
Write-Host "2. Navigate to Security > 2-Step Verification" -ForegroundColor White
Write-Host "3. Scroll down to 'App passwords'" -ForegroundColor White
Write-Host "4. Generate a new app password for 'Mail'" -ForegroundColor White
Write-Host "5. Copy the 16-character password" -ForegroundColor White
Write-Host ""

Write-Host "Alternative: Use a dedicated email service" -ForegroundColor Yellow
Write-Host "- SendGrid (free tier available)" -ForegroundColor White
Write-Host "- Mailgun (free tier available)" -ForegroundColor White
Write-Host "- AWS SES (very cheap)" -ForegroundColor White
Write-Host ""

$useGmail = Read-Host "Do you want to set up Gmail? (y/n)"

if ($useGmail -eq "y") {
    Write-Host ""
    Write-Host "Enter your Gmail credentials:" -ForegroundColor Yellow
    
    $emailUser = Read-Host "Gmail address (e.g., yourname@gmail.com)"
    $emailPassword = Read-Host "App Password (16 characters)" -AsSecureString
    
    # Convert secure string to plain text
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($emailPassword)
    $plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    
    if ($emailUser -and $plainPassword) {
        Write-Host ""
        Write-Host "Updating Cloud Run service with email credentials..." -ForegroundColor Yellow
        
        # Get current environment variables
        $currentEnv = gcloud run services describe calmconnect --region=asia-south1 --format='value(spec.template.spec.containers[0].env[0].value,spec.template.spec.containers[0].env[1].value,spec.template.spec.containers[0].env[2].value,spec.template.spec.containers[0].env[3].value,spec.template.spec.containers[0].env[4].value,spec.template.spec.containers[0].env[5].value,spec.template.spec.containers[0].env[6].value)'
        
        # Update with email credentials
        gcloud run services update calmconnect --region=asia-south1 --set-env-vars "DATABASE_URL=postgresql://neondb_owner:npg_KfO0l4dVCyJP@ep-wispy-thunder-adm7x8dy-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require,JWT_SECRET=calmconnect-jwt-secret-key-2024,PHONE_ENCRYPTION_KEY=calmconnect-phone-encryption-key-2024,GEMINI_API_KEY=temp-gemini-key,GOOGLE_CLIENT_ID=temp-google-client-id,GOOGLE_CLIENT_SECRET=temp-google-client-secret,EMAIL_USER=$emailUser,EMAIL_PASSWORD=$plainPassword,NODE_ENV=production"
        
        Write-Host ""
        Write-Host "Email setup completed!" -ForegroundColor Green
        Write-Host "Your application will now send real verification emails." -ForegroundColor Green
        Write-Host ""
        Write-Host "Test it by:" -ForegroundColor Yellow
        Write-Host "1. Going to your application" -ForegroundColor White
        Write-Host "2. Registering with a new email" -ForegroundColor White
        Write-Host "3. Checking your email for the verification code" -ForegroundColor White
    } else {
        Write-Host "Email credentials not provided. Setup cancelled." -ForegroundColor Red
    }
} else {
    Write-Host ""
    Write-Host "For now, verification codes will be shown in the application logs." -ForegroundColor Yellow
    Write-Host "You can check them by running:" -ForegroundColor Cyan
    Write-Host "gcloud run services logs read calmconnect --region=asia-south1 --limit=20" -ForegroundColor White
}

Write-Host ""
Write-Host "Setup complete!" -ForegroundColor Green
