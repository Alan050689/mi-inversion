# Mi Inversión - Investment Tracking Application

## Overview

Mi Inversión is a web-based MVP application for tracking contributions to a real estate investment project. The app allows users to record financial transactions (contributions and withdrawals) in both USD and ARS currencies, with support for multiple exchange rate types (Blue, Oficial, Manual). It includes a benchmark comparison feature against S&P 500 performance to evaluate investment returns.

The application is designed to be lightweight and simple, originally intended to run on Replit Free tier with local JSON file persistence, though it's configured to support PostgreSQL via Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack Query (React Query) for server state management
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful endpoints under `/api/*` prefix
- **Hot Reload**: Vite dev server middleware for development

### Data Storage
- **Primary**: Drizzle ORM configured for PostgreSQL (DATABASE_URL required)
- **Fallback**: In-memory storage with optional JSON file persistence
- **Schema**: Zod-based validation schemas shared between client and server

### Key Design Patterns
1. **Shared Schema**: Types and validation schemas in `/shared/schema.ts` are used by both frontend and backend
2. **API Request Helper**: Centralized fetch wrapper in `queryClient.ts` for consistent error handling
3. **Storage Interface**: Abstract `IStorage` interface allows swapping between memory and database storage

### Directory Structure
```
├── client/           # React frontend
│   └── src/
│       ├── components/  # UI components (shadcn/ui + custom)
│       ├── pages/       # Route components
│       ├── hooks/       # Custom React hooks
│       └── lib/         # Utilities and helpers
├── server/           # Express backend
│   ├── routes.ts     # API route definitions
│   ├── storage.ts    # Data persistence layer
│   └── fx.ts         # Exchange rate fetching
├── shared/           # Shared types and schemas
└── migrations/       # Drizzle database migrations
```

## External Dependencies

### Exchange Rate API
- **Service**: DolarAPI (https://dolarapi.com/v1/dolares)
- **Purpose**: Fetches real-time Blue and Oficial USD/ARS exchange rates
- **Caching**: 5-minute cache with fallback rates if API fails
- **Timeout**: 5 second request timeout

### Database
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Configuration**: Requires `DATABASE_URL` environment variable
- **Migrations**: Managed via `drizzle-kit push` command

### UI Components
- **Library**: shadcn/ui (Radix UI primitives + Tailwind)
- **Icons**: Lucide React icons
- **Style**: New York variant with neutral base colors

### Build & Development
- **TypeScript**: Strict mode enabled
- **Bundler**: esbuild for server, Vite for client
- **Path Aliases**: `@/` for client source, `@shared/` for shared modules