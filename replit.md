# Kerala Theater Guide

## Overview

Kerala Theater Guide is a comprehensive web application for discovering and reviewing cinema halls across Kerala's districts. The platform allows users to browse theaters by location, view detailed information including amenities and ratings, leave reviews, and visualize theater locations on an interactive map. Built with a modern full-stack architecture, the application provides an intuitive Material Design-inspired interface optimized for both desktop and mobile experiences.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type-safe component development
- **Routing**: Wouter for lightweight client-side navigation
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: Radix UI primitives with custom shadcn/ui components for accessible, composable interfaces
- **Styling**: Tailwind CSS with custom Material Design 3 color tokens and spacing system
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework for RESTful API endpoints
- **Language**: TypeScript throughout for consistent type safety
- **API Design**: REST endpoints for theater CRUD operations, district filtering, and review management
- **Data Validation**: Zod schemas for runtime type checking and API request validation
- **Error Handling**: Centralized error middleware with structured error responses

### Data Storage
- **ORM**: Drizzle ORM for type-safe database operations and schema management
- **Database**: PostgreSQL (configured for Neon serverless) with automatic UUID generation
- **Schema**: Well-structured tables for users, theaters, and reviews with proper relationships
- **Development Storage**: In-memory storage class for development with seeded Kerala theater data
- **Migrations**: Drizzle Kit for database schema migrations and version control

### Authentication & Authorization
- Session-based authentication using Express sessions with PostgreSQL session store
- User model with username/password authentication
- Review attribution linking reviews to authenticated users or anonymous submissions

### External Dependencies
- **Maps**: Leaflet.js for interactive theater location mapping
- **Icons**: Lucide React for consistent iconography throughout the application
- **Fonts**: Google Fonts (Roboto family) and Material Icons for Material Design compliance
- **Image Processing**: Unsplash integration for theater imagery with automatic optimization parameters
- **Development**: Replit-specific plugins for enhanced development experience and error handling

### Design System
- **Material Design 3**: Custom CSS variables implementing Material Design color tokens
- **Typography**: Roboto font family with appropriate weights for Material Design hierarchy
- **Components**: Comprehensive UI component library built on Radix primitives
- **Responsive Design**: Mobile-first approach with Tailwind responsive utilities
- **Accessibility**: ARIA-compliant components with keyboard navigation support

### Key Features
- District-based theater browsing with visual district cards
- Detailed theater pages with ratings, reviews, and amenities
- Interactive map integration showing theater locations
- Review system with star ratings and comment functionality
- Responsive design optimized for mobile and desktop usage
- Real-time data fetching with optimistic updates and error handling