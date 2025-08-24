# CalmConnect GCP Deployment Script for Windows
# This script helps deploy the CalmConnect application to Google Cloud Platform

param(
    [string]$ProjectId = "calmconnect-470013",
    [string]$Region = "asia-south1"
)

$ErrorActionPreference = "Stop"

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"

# Configuration
$ServiceName = "calmconnect"
$ImageName = "gcr.io/$ProjectId/$ServiceName"

Write-Host "🚀 CalmConnect GCP Deployment Script" -ForegroundColor $Green
Write-Host "==================================" -ForegroundColor $Green

# Check if gcloud is installed
try {
    $null = Get-Command gcloud -ErrorAction Stop
} catch {
    Write-Host "❌ Google Cloud SDK is not installed. Please install it first." -ForegroundColor $Red
    Write-Host "Visit: https://cloud.google.com/sdk/docs/install" -ForegroundColor $Red
    exit 1
}

# Check if docker is installed
try {
    $null = Get-Command docker -ErrorAction Stop
} catch {
    Write-Host "❌ Docker is not installed. Please install it first." -ForegroundColor $Red
    Write-Host "Visit: https://www.docker.com/products/docker-desktop/" -ForegroundColor $Red
    exit 1
}

Write-Host "✅ Using Project ID: $ProjectId" -ForegroundColor $Green

# Set the project
Write-Host "🔧 Setting GCP project..." -ForegroundColor $Yellow
gcloud config set project $ProjectId

# Enable required APIs
Write-Host "🔧 Enabling required APIs..." -ForegroundColor $Yellow
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Build and push the Docker image
Write-Host "🐳 Building and pushing Docker image..." -ForegroundColor $Yellow
docker build -t $ImageName .
Write-Host "📤 Pushing image to Container Registry..." -ForegroundColor $Yellow
docker push $ImageName

# Deploy to Cloud Run
Write-Host "🚀 Deploying to Cloud Run..." -ForegroundColor $Yellow
gcloud run deploy $ServiceName `
    --image $ImageName `
    --platform managed `
    --region $Region `
    --allow-unauthenticated `
    --port 8080 `
    --memory 1Gi `
    --cpu 1 `
    --max-instances 10 `
    --set-env-vars NODE_ENV=production

# Get the service URL
$ServiceUrl = gcloud run services describe $ServiceName --region=$Region --format='value(status.url)'

Write-Host "✅ Deployment completed successfully!" -ForegroundColor $Green
Write-Host "🌐 Your application is available at: $ServiceUrl" -ForegroundColor $Green
Write-Host ""
Write-Host "📝 Important Notes:" -ForegroundColor $Yellow
Write-Host "1. Make sure to set up your environment variables in Cloud Run"
Write-Host "2. Configure your database connection"
Write-Host "3. Set up authentication secrets"
Write-Host "4. Configure external services"
Write-Host ""
Write-Host "🔧 To set environment variables, run:" -ForegroundColor $Yellow
Write-Host "gcloud run services update $ServiceName --region=$Region --set-env-vars KEY1=VALUE1,KEY2=VALUE2"
