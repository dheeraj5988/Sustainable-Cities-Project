# Sustainable Cities App

A comprehensive platform for building sustainable cities and communities through citizen engagement, issue reporting, and community collaboration.

![Sustainable Cities App]([https://placeholder.svg?height=300&width=800&query=Sustainable+Cities+App+Dashboard](https://v0-sustainable-cities-app-ten.vercel.app/login))

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## 🌟 Overview

The Sustainable Cities App is designed to empower citizens, city workers, and administrators to collaborate in building more sustainable urban environments. The platform facilitates issue reporting, community discussions, and data visualization to address urban sustainability challenges.

### Core Objectives

- Enable citizens to report environmental and infrastructure issues
- Facilitate community discussions around sustainability topics
- Provide city workers with tools to manage and resolve reported issues
- Give administrators oversight and analytics on sustainability initiatives
- Visualize sustainability data through interactive maps and dashboards

## ✨ Features

### For Citizens

- **Issue Reporting**: Report environmental and infrastructure issues with location, photos, and descriptions
- **Community Forum**: Participate in discussions about local sustainability initiatives
- **Issue Tracking**: Follow the status of reported issues
- **Interactive Maps**: View reported issues and sustainability data on interactive maps
- **User Profiles**: Manage personal information and track contribution history

### For Workers

- **Task Management**: View and manage assigned tasks
- **Issue Resolution**: Update issue status and provide resolution details
- **Mobile-Friendly Interface**: Access tools on-the-go for fieldwork

### For Administrators

- **User Management**: Manage users, roles, and permissions
- **Analytics Dashboard**: View statistics on issues, resolutions, and community engagement
- **Worker Assignment**: Assign issues to appropriate workers
- **Content Moderation**: Moderate community forum discussions
- **System Configuration**: Configure system settings and parameters

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Server Actions
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Mapping**: Mapbox GL JS
- **Deployment**: Vercel

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- Git
- Supabase account (for database and authentication)
- Mapbox account (for maps)

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/dheeraj5988/sustainable-cities-app.git
   cd sustainable-cities-app
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`

3. Set up environment variables (see [Environment Variables](#environment-variables) section)

4. Run the development server:
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   \`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_JWT_SECRET=your_supabase_jwt_secret

# Database (provided by Supabase)
POSTGRES_URL=your_postgres_url
POSTGRES_PRISMA_URL=your_postgres_prisma_url
POSTGRES_URL_NON_POOLING=your_postgres_url_non_pooling
POSTGRES_USER=your_postgres_user
POSTGRES_HOST=your_postgres_host
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_DATABASE=your_postgres_database

# Mapbox (for maps)
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token

# API URL
NEXT_PUBLIC_API_URL=http://localhost:3000/api
\`\`\`

## 📁 Project Structure

\`\`\`
sustainable-cities-app/
├── app/                    # Next.js App Router
│   ├── admin/              # Admin pages
│   ├── api/                # API routes
│   ├── cities/             # City data pages
│   ├── dashboard/          # User dashboard
│   ├── forum/              # Community forum
│   ├── learn/              # Educational content
│   ├── map/                # Interactive maps
│   ├── profile/            # User profile
│   ├── reports/            # Issue reporting
│   └── worker/             # Worker interface
├── components/             # React components
│   ├── forum/              # Forum components
│   ├── layout/             # Layout components
│   ├── map/                # Map components
│   ├── reports/            # Report components
│   └── ui/                 # UI components
├── context/                # React context providers
├── lib/                    # Utility functions and services
│   ├── api/                # API services
│   ├── supabase/           # Supabase client
│   └── database.types.ts   # Database type definitions
├── public/                 # Static assets
└── types/                  # TypeScript type definitions
\`\`\`

## 🗄️ Database Schema

The application uses the following main tables:

- **profiles**: User profiles and roles
- **reports**: Environmental and infrastructure issues
- **forum_threads**: Community discussion threads
- **forum_comments**: Comments on discussion threads
- **worker_invites**: Invitations for worker accounts

For a complete database schema, refer to the `lib/database.types.ts` file.

## 📚 API Documentation

The application uses Next.js API routes and Server Actions for backend functionality. Key API endpoints include:

- `/api/create-user`: Create new users (admin only)
- `/api/reports`: Manage issue reports
- `/api/forum`: Manage forum threads and comments
- `/api/users`: User management

## 🤝 Contributing

We welcome contributions to the Sustainable Cities App! Here's how you can contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and conventions
- Write tests for new features
- Update documentation as needed
- Ensure your code passes linting and type checking

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built with ❤️ for sustainable cities and communities.
\`\`\`

This README provides a comprehensive overview of your Sustainable Cities App project, including setup instructions, features, and contribution guidelines. You can customize it further to match your specific project details and preferences.

The README is structured to be informative for both users who want to run the project and developers who want to contribute. It includes:

1. **Project overview** explaining the purpose and goals
2. **Feature breakdown** for different user roles
3. **Technical stack** details
4. **Setup instructions** with prerequisites and environment variables
5. **Project structure** to help navigate the codebase
6. **Database schema** overview
7. **API documentation** summary
8. **Contribution guidelines** for developers

You can add this README.md file to your GitHub repository to provide clear documentation for your project.
\`\`\`

