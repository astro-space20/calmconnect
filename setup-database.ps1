# CalmConnect Database Setup Script
# This script helps set up a Neon database for the CalmConnect application

Write-Host "🗄️ CalmConnect Database Setup" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Database Setup Options:" -ForegroundColor Yellow
Write-Host "1. Neon Database (Recommended - Free tier available)"
Write-Host "2. Google Cloud SQL"
Write-Host "3. Use existing database"
Write-Host ""

$choice = Read-Host "Enter your choice (1-3)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🌐 Setting up Neon Database..." -ForegroundColor Yellow
        Write-Host "1. Go to https://neon.tech"
        Write-Host "2. Sign up for a free account"
        Write-Host "3. Create a new project"
        Write-Host "4. Copy the connection string"
        Write-Host ""
        Write-Host "🔗 Your connection string will look like:"
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
            gcloud run services update calmconnect --region=asia-south1 --set-env-vars "DATABASE_URL=$databaseUrl,JWT_SECRET=$jwtSecret,PHONE_ENCRYPTION_KEY=$phoneKey,NODE_ENV=production"
            
            Write-Host ""
            Write-Host "✅ Database setup completed!" -ForegroundColor Green
            Write-Host "🔐 Generated secure secrets for JWT and phone encryption"
            Write-Host ""
            Write-Host "📝 Next steps:" -ForegroundColor Yellow
            Write-Host "1. Set up your database schema: npm run db:push"
            Write-Host "2. Configure external services (Twilio, Google OAuth, etc.)"
            Write-Host "3. Test your application"
        }
    }
    "2" {
        Write-Host ""
        Write-Host "☁️ Setting up Google Cloud SQL..." -ForegroundColor Yellow
        Write-Host "This will create a PostgreSQL instance in your GCP project."
        Write-Host ""
        
        $confirm = Read-Host "Do you want to proceed? (y/n)"
        if ($confirm -eq "y") {
            Write-Host "🔧 Creating Cloud SQL instance..." -ForegroundColor Yellow
            gcloud sql instances create calmconnect-db --database-version=POSTGRES_15 --tier=db-f1-micro --region=asia-south1 --storage-type=SSD --storage-size=10GB
            
            Write-Host "🔐 Setting up database user..." -ForegroundColor Yellow
            gcloud sql users set-password postgres --instance=calmconnect-db --password=calmconnect123
            
            Write-Host "📊 Creating database..." -ForegroundColor Yellow
            gcloud sql databases create calmconnect --instance=calmconnect-db
            
            Write-Host "🔗 Getting connection info..." -ForegroundColor Yellow
            $connectionName = gcloud sql instances describe calmconnect-db --format='value(connectionName)'
            
            Write-Host ""
            Write-Host "✅ Cloud SQL setup completed!" -ForegroundColor Green
            Write-Host "🔗 Connection name: $connectionName"
            Write-Host "📝 Database URL: postgresql://postgres:calmconnect123@localhost/calmconnect"
            Write-Host ""
            Write-Host "⚠️ Note: You'll need to use Cloud SQL Proxy to connect from Cloud Run"
        }
    }
    "3" {
        Write-Host ""
        Write-Host "🔗 Using existing database..." -ForegroundColor Yellow
        $databaseUrl = Read-Host "Enter your existing database URL"
        
        if ($databaseUrl) {
            Write-Host "🔧 Updating Cloud Run service..." -ForegroundColor Yellow
            gcloud run services update calmconnect --region=asia-south1 --set-env-vars "DATABASE_URL=$databaseUrl,NODE_ENV=production"
            
            Write-Host "✅ Database connection updated!" -ForegroundColor Green
        }
    }
    default {
        Write-Host "❌ Invalid choice. Please run the script again." -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎉 Setup complete! Your CalmConnect application should now be running." -ForegroundColor Green
