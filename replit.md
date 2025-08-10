# CalmTrack - Mental Wellness & Anxiety Support Application

## Overview

CalmTrack is a comprehensive mental wellness application designed specifically to support users with anxiety through evidence-based tracking and management tools. The application provides a holistic approach to mental health by combining activity tracking, nutrition logging, social exposure management, and cognitive behavioral therapy (CBT) techniques. Built as a mobile-first progressive web application, CalmTrack emphasizes gentle progression, self-compassion, and positive reinforcement to help users build resilience and manage anxiety symptoms.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and component-based architecture
- **Routing**: Wouter for lightweight client-side routing with minimal overhead
- **State Management**: TanStack Query for server state management, local React state for UI state
- **UI Components**: Radix UI primitives with shadcn/ui design system for accessible, customizable components
- **Styling**: Tailwind CSS with custom CSS variables for theming and responsive design
- **Build Tool**: Vite for fast development and optimized production builds
- **Design Pattern**: Mobile-first responsive design with a maximum width container to simulate mobile app experience

### Backend Architecture
- **Runtime**: Node.js with Express.js framework for RESTful API endpoints
- **Database ORM**: Drizzle ORM with PostgreSQL dialect for type-safe database operations
- **Data Validation**: Zod schemas for runtime type validation and API contract enforcement
- **Storage Pattern**: Repository pattern with in-memory fallback for development and PostgreSQL for production
- **API Design**: RESTful endpoints following resource-based URL structure with proper HTTP status codes

### Data Model Design
The application uses five core entities reflecting different aspects of mental wellness tracking:
- **Activities**: Physical activities with duration, type, and emotional feedback
- **Nutrition Logs**: Meal tracking with focus on mood-supporting nutrients
- **Social Exposures**: Graduated exposure therapy tracking with before/after assessments
- **Thought Journals**: CBT-based thought challenging and reframing exercises
- **Empathy Check-ins**: Self-compassion and emotional validation entries

### Component Architecture
- **Layout Components**: Mobile-first container with bottom navigation for native app feel
- **Form Components**: Reusable form components with validation and submission handling
- **Feature Components**: Specialized components for each tracking category with consistent patterns
- **UI Library**: Comprehensive set of accessible components built on Radix UI primitives

### Development Environment
- **Hot Reload**: Vite development server with HMR for rapid iteration
- **Type Safety**: Full TypeScript coverage across client, server, and shared modules
- **Path Resolution**: Organized import aliases for clean module resolution
- **Development Tools**: Runtime error overlay and Replit-specific development enhancements

## External Dependencies

### Database & ORM
- **Neon Database**: Serverless PostgreSQL database for production data storage
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL adapter for schema management and queries
- **Drizzle Kit**: Database migration and schema management tooling

### UI & Styling
- **Radix UI**: Headless, accessible component primitives for complex UI patterns
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens for consistent theming
- **Lucide React**: Icon library with consistent design language and accessibility features
- **Class Variance Authority**: Type-safe component variant management for design system consistency

### State Management & Data Fetching
- **TanStack React Query**: Server state management with caching, background updates, and optimistic updates
- **React Hook Form**: Form state management with validation and performance optimization
- **Hookform Resolvers**: Integration between React Hook Form and Zod for schema validation

### Charts & Visualization
- **Recharts**: React-based charting library for progress visualization and data insights

### Development & Build Tools
- **Vite**: Fast build tool with ES modules and optimized bundling for development and production
- **ESBuild**: Fast JavaScript bundler for server-side code compilation
- **TypeScript**: Static type checking for enhanced developer experience and code reliability

### Validation & Type Safety
- **Zod**: Runtime schema validation with TypeScript integration for API contracts and form validation
- **Drizzle Zod**: Integration between Drizzle ORM and Zod for database schema validation

The architecture emphasizes developer experience, type safety, and performance while maintaining a clean separation of concerns between client and server code. The mobile-first design approach ensures optimal user experience on the primary target platform while remaining responsive across device sizes.