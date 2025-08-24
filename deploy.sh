#!/bin/bash

# CalmConnect GCP Deployment Script
# This script helps deploy the CalmConnect application to Google Cloud Platform

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID=${PROJECT_ID:-""}
REGION=${REGION:-"us-central1"}
SERVICE_NAME="calmconnect"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo -e "${GREEN}🚀 CalmConnect GCP Deployment Script${NC}"
echo "=================================="

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ Google Cloud SDK is not installed. Please install it first.${NC}"
    echo "Visit: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install it first.${NC}"
    exit 1
fi

# Get project ID if not provided
if [ -z "$PROJECT_ID" ]; then
    echo -e "${YELLOW}📋 No PROJECT_ID provided. Please enter your GCP Project ID:${NC}"
    read -p "Project ID: " PROJECT_ID
    if [ -z "$PROJECT_ID" ]; then
        echo -e "${RED}❌ Project ID is required. Exiting.${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Using Project ID: ${PROJECT_ID}${NC}"

# Set the project
echo -e "${YELLOW}🔧 Setting GCP project...${NC}"
gcloud config set project $PROJECT_ID

# Enable required APIs
echo -e "${YELLOW}🔧 Enabling required APIs...${NC}"
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Build and push the Docker image
echo -e "${YELLOW}🐳 Building and pushing Docker image...${NC}"
docker build -t $IMAGE_NAME .
docker push $IMAGE_NAME

# Deploy to Cloud Run
echo -e "${YELLOW}🚀 Deploying to Cloud Run...${NC}"
gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_NAME \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --port 8080 \
    --memory 1Gi \
    --cpu 1 \
    --max-instances 10 \
    --set-env-vars NODE_ENV=production

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)')

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Your application is available at: ${SERVICE_URL}${NC}"
echo ""
echo -e "${YELLOW}📝 Important Notes:${NC}"
echo "1. Make sure to set up your environment variables in Cloud Run"
echo "2. Configure your database connection (DATABASE_URL)"
echo "3. Set up authentication secrets (JWT_SECRET, etc.)"
echo "4. Configure external services (Twilio, Google OAuth, etc.)"
echo ""
echo -e "${YELLOW}🔧 To set environment variables, run:${NC}"
echo "gcloud run services update $SERVICE_NAME --region=$REGION --set-env-vars KEY1=VALUE1,KEY2=VALUE2"

