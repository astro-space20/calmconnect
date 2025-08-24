# CalmConnect GCP Deployment Guide

This guide will help you deploy CalmConnect to Google Cloud Platform using project ID `calmconnect-470013`.

## 🚀 Quick Start

### Prerequisites Installation

1. **Run the setup script** (as Administrator):
   ```powershell
   .\setup-prerequisites.ps1
   ```

2. **Install Docker Desktop**:
   - Download from: https://www.docker.com/products/docker-desktop/
   - Install and restart your computer

3. **Install Google Cloud SDK**:
   - Download from: https://cloud.google.com/sdk/docs/install
   - Install and restart your terminal

### Deploy to GCP

Once prerequisites are installed, run:
```powershell
.\deploy.ps1
```

## 📋 Manual Installation Steps

### 1. Install Docker Desktop

1. Visit: https://www.docker.com/products/docker-desktop/
2. Download Docker Desktop for Windows
3. Run the installer
4. Restart your computer
5. Start Docker Desktop

### 2. Install Google Cloud SDK

1. Visit: https://cloud.google.com/sdk/docs/install
2. Download the Windows installer
3. Run the installer
4. Open a new terminal and authenticate:
   ```powershell
   gcloud auth login
   gcloud config set project calmconnect-470013
   ```

## 🔧 Deployment Process

The deployment script will:

1. ✅ **Validate Prerequisites**: Check for gcloud and docker
2. 🔧 **Set Up Project**: Configure GCP project `calmconnect-470013`
3. 🔧 **Enable APIs**: Enable required Google Cloud APIs
4. 🐳 **Build & Push**: Build Docker image and push to Container Registry
5. 🚀 **Deploy**: Deploy to Cloud Run in Mumbai (asia-south1)
6. 🌐 **Show URL**: Display your application URL

## 📝 Environment Variables

After deployment, set up your environment variables:

```powershell
gcloud run services update calmconnect --region=asia-south1 --set-env-vars DATABASE_URL=your-db-url,JWT_SECRET=your-secret,PHONE_ENCRYPTION_KEY=your-key
```

### Required Variables:
- `DATABASE_URL`: Your database connection string
- `JWT_SECRET`: Secret for JWT token signing
- `PHONE_ENCRYPTION_KEY`: Key for phone number encryption
- `NODE_ENV`: Set to `production`

### Optional Variables:
- `TWILIO_ACCOUNT_SID`: For SMS functionality
- `TWILIO_AUTH_TOKEN`: Twilio authentication token
- `TWILIO_PHONE_NUMBER`: Twilio phone number
- `GEMINI_API_KEY`: Google Gemini AI API key
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret

## 🆘 Troubleshooting

### Common Issues:

1. **Docker not found**: Install Docker Desktop and restart
2. **gcloud not found**: Install Google Cloud SDK and restart terminal
3. **Permission errors**: Run PowerShell as Administrator
4. **Build failures**: Check Dockerfile and dependencies

### Useful Commands:

```powershell
# Check Docker status
docker --version
docker ps

# Check gcloud status
gcloud --version
gcloud config list

# View deployment logs
gcloud run services logs read calmconnect --region=asia-south1

# Update environment variables
gcloud run services update calmconnect --region=asia-south1 --set-env-vars KEY=VALUE
```

## 🌐 After Deployment

1. **Test your application** at the provided URL
2. **Set up environment variables** for full functionality
3. **Configure external services** (Twilio, Google OAuth, etc.)
4. **Set up monitoring** and alerting
5. **Configure custom domain** (optional)

## 📞 Support

- **GCP Documentation**: https://cloud.google.com/docs
- **Docker Documentation**: https://docs.docker.com/
- **Project Issues**: Check the application logs for errors

