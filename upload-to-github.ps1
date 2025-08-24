# GitHub Upload Script for CalmConnect

Write-Host "GitHub Upload Script for CalmConnect" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

Write-Host "This script will help you upload your CalmConnect project to GitHub." -ForegroundColor Yellow
Write-Host ""

# Check if git is installed
try {
    $null = Get-Command git -ErrorAction Stop
} catch {
    Write-Host "❌ Git is not installed. Please install Git first." -ForegroundColor Red
    Write-Host "Download from: https://git-scm.com/downloads" -ForegroundColor Cyan
    exit 1
}

# Check if we're in a git repository
$gitStatus = git status 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "🔧 Initializing Git repository..." -ForegroundColor Yellow
    git init
}

Write-Host ""
Write-Host "📋 Steps to upload to GitHub:" -ForegroundColor Cyan
Write-Host "1. Create a new repository on GitHub" -ForegroundColor White
Write-Host "2. Copy the repository URL" -ForegroundColor White
Write-Host "3. Enter the URL when prompted" -ForegroundColor White
Write-Host ""

$repoUrl = Read-Host "Enter your GitHub repository URL (e.g., https://github.com/username/calmconnect.git)"

if ($repoUrl) {
    Write-Host ""
    Write-Host "🔧 Setting up Git repository..." -ForegroundColor Yellow
    
    # Add all files
    Write-Host "📁 Adding files to Git..." -ForegroundColor Yellow
    git add .
    
    # Create initial commit
    Write-Host "💾 Creating initial commit..." -ForegroundColor Yellow
    git commit -m "Initial commit: CalmConnect - Mental Wellness Platform
    
    - Complete React + TypeScript application
    - Express.js backend with PostgreSQL
    - Google Cloud deployment ready
    - Email verification system
    - Mental health tracking features
    - Activity and fitness monitoring
    - Counselling booking system
    - AI-powered insights
    - Mobile responsive design
    - Comprehensive documentation"
    
    # Add remote origin
    Write-Host "🔗 Adding remote origin..." -ForegroundColor Yellow
    git remote add origin $repoUrl
    
    # Push to GitHub
    Write-Host "📤 Pushing to GitHub..." -ForegroundColor Yellow
    git branch -M main
    git push -u origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Successfully uploaded to GitHub!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🎉 Your repository is now live at:" -ForegroundColor Cyan
        Write-Host $repoUrl -ForegroundColor White
        Write-Host ""
        Write-Host "📝 Next steps:" -ForegroundColor Yellow
        Write-Host "1. Set up GitHub Secrets for CI/CD" -ForegroundColor White
        Write-Host "2. Configure branch protection rules" -ForegroundColor White
        Write-Host "3. Add repository description and topics" -ForegroundColor White
        Write-Host "4. Set up GitHub Pages (optional)" -ForegroundColor White
        Write-Host ""
        Write-Host "🔧 GitHub Secrets to configure:" -ForegroundColor Cyan
        Write-Host "- DATABASE_URL" -ForegroundColor White
        Write-Host "- JWT_SECRET" -ForegroundColor White
        Write-Host "- EMAIL_USER" -ForegroundColor White
        Write-Host "- EMAIL_PASSWORD" -ForegroundColor White
        Write-Host "- GCP_SA_KEY" -ForegroundColor White
        Write-Host "- GCP_PROJECT_ID" -ForegroundColor White
        Write-Host "- GEMINI_API_KEY" -ForegroundColor White
        Write-Host "- GOOGLE_CLIENT_ID" -ForegroundColor White
        Write-Host "- GOOGLE_CLIENT_SECRET" -ForegroundColor White
    } else {
        Write-Host "❌ Failed to push to GitHub. Please check your repository URL and try again." -ForegroundColor Red
    }
} else {
    Write-Host "❌ No repository URL provided. Upload cancelled." -ForegroundColor Red
}

Write-Host ""
Write-Host "📚 Additional GitHub Setup:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Repository Settings:" -ForegroundColor Cyan
Write-Host "   - Go to Settings > Pages to enable GitHub Pages" -ForegroundColor White
Write-Host "   - Set up branch protection rules" -ForegroundColor White
Write-Host "   - Configure issue templates" -ForegroundColor White
Write-Host ""
Write-Host "2. GitHub Secrets (Settings > Secrets and variables > Actions):" -ForegroundColor Cyan
Write-Host "   - Add all environment variables for CI/CD" -ForegroundColor White
Write-Host ""
Write-Host "3. Repository Topics:" -ForegroundColor Cyan
Write-Host "   - mental-health, wellness, anxiety, cbt, react, typescript, nodejs" -ForegroundColor White
Write-Host ""
Write-Host "4. Social Preview:" -ForegroundColor Cyan
Write-Host "   - Add a social preview image" -ForegroundColor White
Write-Host "   - Update repository description" -ForegroundColor White

Write-Host ""
Write-Host "🎉 Your CalmConnect project is ready for the world!" -ForegroundColor Green
