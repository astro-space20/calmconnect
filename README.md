# 🧘‍♀️ CalmConnect - Mental Wellness & Anxiety Management Platform

[![Deploy to Google Cloud](https://img.shields.io/badge/Deploy%20to-Google%20Cloud-blue?logo=google-cloud)](https://calmconnect-g7wfxf7cvq-el.a.run.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

## 🌟 Live Demo

**🌐 Application URL**: https://calmconnect-g7wfxf7cvq-el.a.run.app

## 📖 About CalmConnect

CalmConnect is a comprehensive mental wellness platform designed to help users manage anxiety, track their mental health journey, and build healthier habits. Built with modern web technologies and deployed on Google Cloud Platform.

### 🎯 Key Features

- **🧠 Mental Health Tracking**: CBT thought journaling, mood monitoring, and anxiety exposure therapy
- **🏃‍♀️ Activity & Fitness**: Comprehensive activity tracking with wearable device integration
- **💤 Sleep & Wellness**: Sleep tracking, heart rate monitoring, and nutrition logging
- **👥 Counselling System**: Professional counselling booking and session management
- **🏆 Gamification**: Achievement system and progress tracking
- **📱 Mobile Responsive**: Optimized for all devices
- **🔐 Secure Authentication**: Email verification and JWT-based security
- **🤖 AI Integration**: Gemini AI-powered insights and guidance

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Shadcn/ui** components
- **React Query** for state management
- **React Router** for navigation

### Backend
- **Node.js** with TypeScript
- **Express.js** framework
- **Drizzle ORM** for database operations
- **PostgreSQL** (Neon Database)
- **JWT** for authentication
- **Passport.js** for OAuth

### Infrastructure
- **Google Cloud Platform**
- **Cloud Run** for hosting
- **Container Registry** for Docker images
- **Neon Database** for PostgreSQL
- **Gmail SMTP** for email services

### External Integrations
- **Google OAuth** for social login
- **Twilio** for SMS verification
- **Google Gemini AI** for intelligent features
- **Fitbit/Apple Health/Google Fit** for wearable integration

## 🚀 Quick Start

### Prerequisites
- Node.js 20.x or higher
- Docker (for containerization)
- Google Cloud SDK (for deployment)
- PostgreSQL database (Neon recommended)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/calmconnect.git
   cd calmconnect
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Set up database**
   ```bash
   # Create a Neon database or use your own PostgreSQL
   npm run db:push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:5000
   ```

## 🐳 Docker Deployment

### Build and run with Docker
```bash
# Build the image
docker build -t calmconnect .

# Run locally
docker run -p 8080:8080 calmconnect

# Or use Docker Compose
docker-compose up
```

## ☁️ Google Cloud Deployment

### Automated Deployment
```bash
# Run the deployment script
.\deploy.ps1  # Windows
./deploy.sh   # Linux/Mac
```

### Manual Deployment
```bash
# 1. Set up Google Cloud project
gcloud config set project your-project-id

# 2. Enable required APIs
gcloud services enable cloudbuild.googleapis.com run.googleapis.com containerregistry.googleapis.com

# 3. Build and push Docker image
docker build -t gcr.io/your-project-id/calmconnect .
docker push gcr.io/your-project-id/calmconnect

# 4. Deploy to Cloud Run
gcloud run deploy calmconnect \
  --image gcr.io/your-project-id/calmconnect \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --port 8080
```

## 📊 Database Schema

The application uses 16 tables for comprehensive data management:

### Authentication & Users
- `users` - User profiles and authentication
- `otp_codes` - Phone verification codes
- `email_verification_codes` - Email verification

### Health & Wellness
- `activities` - Fitness and activity tracking
- `wearable_devices` - Device integrations
- `sleep_data` - Sleep tracking and analysis
- `heart_rate_data` - Heart rate monitoring
- `nutrition_logs` - Nutrition and meal tracking

### Mental Health
- `social_exposures` - Social anxiety exposure therapy
- `thought_journals` - CBT thought journaling
- `empathy_checkins` - Mood and empathy tracking

### Counselling
- `counsellors` - Counsellor profiles
- `counsellor_time_slots` - Availability scheduling
- `counselling_bookings` - Appointment management

### Gamification
- `achievements` - Progress tracking and rewards

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL=postgresql://username:password@host/database

# Authentication
JWT_SECRET=your-jwt-secret-key
PHONE_ENCRYPTION_KEY=your-phone-encryption-key

# Email Service
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Twilio (SMS)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-number

# AI Services
GEMINI_API_KEY=your-gemini-api-key

# Wearable Integrations
FITBIT_CLIENT_ID=your-fitbit-client-id
FITBIT_CLIENT_SECRET=your-fitbit-client-secret

# Application
NODE_ENV=production
BASE_URL=https://your-app-url.com
```

## 📱 Features Overview

### 🧠 Mental Health Management
- **CBT Thought Journaling**: Challenge negative thoughts with evidence-based techniques
- **Social Exposure Therapy**: Gradual exposure to anxiety-inducing situations
- **Mood Tracking**: Daily mood monitoring with insights
- **Empathy Check-ins**: Self-compassion and emotional awareness

### 🏃‍♀️ Activity & Fitness
- **Activity Logging**: Track various physical activities
- **Wearable Integration**: Connect with Fitbit, Apple Health, Google Fit
- **Progress Analytics**: Visual charts and progress tracking
- **Goal Setting**: Set and achieve fitness milestones

### 💤 Sleep & Wellness
- **Sleep Tracking**: Monitor sleep patterns and quality
- **Heart Rate Monitoring**: Track heart rate during activities
- **Nutrition Logging**: Record meals and nutritional intake
- **Wellness Insights**: AI-powered recommendations

### 👥 Professional Support
- **Counsellor Directory**: Browse qualified mental health professionals
- **Appointment Booking**: Schedule counselling sessions
- **Session Management**: Track counselling progress
- **Secure Communication**: Protected session notes

### 🏆 Gamification
- **Achievement System**: Unlock badges for milestones
- **Progress Tracking**: Visual progress indicators
- **Streak Monitoring**: Maintain consistent habits
- **Social Sharing**: Share achievements (optional)

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Email Verification**: Two-factor email verification
- **Password Hashing**: Bcrypt password encryption
- **CORS Protection**: Cross-origin resource sharing security
- **Input Validation**: Comprehensive data validation
- **SQL Injection Protection**: Parameterized queries with Drizzle ORM

## 📈 Performance & Scalability

- **Serverless Architecture**: Auto-scaling with Google Cloud Run
- **CDN Integration**: Fast global content delivery
- **Database Optimization**: Efficient queries and indexing
- **Caching Strategy**: Optimized data fetching
- **Mobile Optimization**: Responsive design for all devices

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Cloud Platform** for hosting infrastructure
- **Neon Database** for serverless PostgreSQL
- **Shadcn/ui** for beautiful UI components
- **Drizzle ORM** for type-safe database operations
- **Vite** for fast development experience

## 📞 Support

- **🌐 Live Application**: https://calmconnect-g7wfxf7cvq-el.a.run.app
- **📧 Email**: support@calmconnect.com
- **🐛 Issues**: [GitHub Issues](https://github.com/yourusername/calmconnect/issues)
- **📖 Documentation**: [Wiki](https://github.com/yourusername/calmconnect/wiki)

## 🚀 Roadmap

- [ ] Mobile app development (React Native)
- [ ] Advanced AI insights and recommendations
- [ ] Group therapy sessions
- [ ] Integration with more wearable devices
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] API for third-party integrations

---

**Made with ❤️ for better mental health and wellness**
