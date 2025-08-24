# CalmConnect Prerequisites Setup Script
# This script helps install required tools for GCP deployment

Write-Host "🔧 CalmConnect Prerequisites Setup" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if (-not $isAdmin) {
    Write-Host "⚠️  This script requires administrator privileges for some operations." -ForegroundColor Yellow
    Write-Host "   Please run PowerShell as Administrator and try again." -ForegroundColor Yellow
    exit 1
}

# Enable Windows features for Docker
Write-Host "🔧 Enabling Windows features for Docker..." -ForegroundColor Yellow

# Enable WSL
Write-Host "   Enabling Windows Subsystem for Linux..." -ForegroundColor Cyan
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart

# Enable Virtual Machine Platform
Write-Host "   Enabling Virtual Machine Platform..." -ForegroundColor Cyan
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

Write-Host "✅ Windows features enabled successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Restart your computer" -ForegroundColor White
Write-Host "2. Install Docker Desktop from: https://www.docker.com/products/docker-desktop/" -ForegroundColor White
Write-Host "3. Install Google Cloud SDK from: https://cloud.google.com/sdk/docs/install" -ForegroundColor White
Write-Host "4. After installation, run: .\deploy.ps1" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Download Links:" -ForegroundColor Yellow
Write-Host "   Docker Desktop: https://www.docker.com/products/docker-desktop/" -ForegroundColor Cyan
Write-Host "   Google Cloud SDK: https://cloud.google.com/sdk/docs/install" -ForegroundColor Cyan

