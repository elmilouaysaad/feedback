# Feedback Kiosk Project Instructions

This workspace contains a Universal Feedback Kiosk System for tablets with:
- React/Next.js frontend with Tailwind CSS
- PostgreSQL backend
- Real-time event management
- Admin dashboard and analytics

## Key Guidelines

### Development Focus
- Tablet-first responsive design (10.1" screens)
- High contrast, large touch targets
- Minimal dependencies for edge/serverless deployment
- TypeScript for type safety

### Database
- PostgreSQL with optimized indexes
- Simple schema: events + feedback tables
- Connection via `postgres` npm package
- Run migrations with: `npm run db:migrate`

### Authentication
- JWT-based admin authentication
- Default password for dev: `admin123`
- Production: Use `ADMIN_PASSWORD_HASH` in environment

### API Patterns
- Next.js Route Handlers in `app/api/`
- Public endpoints: events/current, feedback, analytics
- Admin endpoints require Bearer token
- Error handling with proper HTTP status codes

### Components
- Client components with 'use client' directive
- Server components for data fetching
- Controlled components for forms
- Lucide icons for UI elements

### Real-time Updates
- Currently uses 2-second polling
- Can be upgraded to Supabase Real-time
- Tablet checks for event changes automatically

## Deployment
- Vercel recommended for Next.js hosting
- PostgreSQL hosted service required (e.g., AWS RDS, Railway, Render)
- Environment variables: DATABASE_URL, JWT_SECRET, ADMIN_PASSWORD_HASH

## Common Tasks

```bash
# Install dependencies
npm install

# Run migrations
npm run db:migrate

# Start development
npm run dev

# Build for production
npm run build
```

Access points:
- Tablet UI: /
- Admin Dashboard: /admin (password: admin123)
- Public Analytics: /analytics
