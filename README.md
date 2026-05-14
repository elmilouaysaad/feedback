# Universal Feedback Kiosk System

A modern, tablet-optimized feedback collection system with real-time event management and analytics.

## Features

✅ **Feedback Tablet UI**
- Full-screen, touch-optimized interface
- 5-level feedback system (Terrible → Great)
- Real-time event updates
- Thank you message after submission
- No scrolling, optimized for 10.1" tablets

✅ **Admin Dashboard**
- Password-protected access
- Dynamic event creation and management
- Real-time event activation
- Detailed analytics with charts

✅ **Public Analytics Page**
- Real-time feedback statistics
- No authentication required
- Visual charts and breakdowns
- Auto-refreshing data

✅ **Technical Highlights**
- Next.js 14 with TypeScript
- PostgreSQL database with optimized indexes
- Real-time polling mechanism
- JWT authentication
- Tailwind CSS for responsive design

## Tech Stack

- **Frontend**: React 18, Next.js 14, Tailwind CSS, lucide-react
- **Backend**: Next.js Server Actions & API Routes
- **Database**: PostgreSQL
- **Authentication**: JWT + bcrypt
- **Deployment-ready**: Optimized for Edge/Serverless

## Prerequisites

- Node.js 18+
- PostgreSQL 12+
- npm or yarn

## Setup Instructions

### 1. Environment Setup

```bash
# Clone or navigate to project
cd feedback-kiosk

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
```

### 2. Configure Database

Edit `.env.local` with your PostgreSQL credentials:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/feedback_kiosk
JWT_SECRET=your_random_secret_here
ADMIN_PASSWORD_HASH=leave_empty_for_dev_mode
```

For development, the default admin password is `admin123`.

### 3. Initialize Database

```bash
npm run db:migrate
```

This will:
- Create `events` and `feedback` tables
- Add performance indexes
- Seed a default event

### 4. Run Development Server

```bash
npm run dev
```

Access:
- **Tablet UI**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin
- **Public Analytics**: http://localhost:3000/analytics

## Project Structure

```
feedback-kiosk/
├── app/
│   ├── api/                    # API routes
│   │   ├── admin/login        # Authentication
│   │   ├── events/            # Event CRUD
│   │   ├── feedback/          # Feedback submission
│   │   └── analytics/         # Analytics data
│   ├── components/
│   │   ├── FeedbackTablet.tsx # Main tablet UI
│   │   ├── EventManager.tsx   # Event management
│   │   ├── AdminLogin.tsx     # Login form
│   │   └── AnalyticsView.tsx  # Analytics charts
│   ├── admin/                 # Admin dashboard page
│   ├── analytics/             # Public analytics page
│   ├── lib/
│   │   ├── db.ts             # Database connection
│   │   ├── queries.ts        # SQL queries
│   │   └── auth.ts           # Auth utilities
│   ├── page.tsx              # Home/tablet page
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Tailwind + custom styles
├── database/
│   ├── schema.sql            # Database schema
│   └── migrate.js            # Migration script
├── public/                    # Static assets
└── package.json
```

## API Endpoints

### Public Endpoints

```
GET  /api/events/current      # Get active event
POST /api/feedback            # Submit feedback (rating 1-5)
GET  /api/analytics           # Get analytics data
```

### Admin Endpoints (requires JWT token)

```
POST /api/admin/login         # Login with password
GET  /api/events              # List all events
POST /api/events              # Create event
PUT  /api/events              # Set active event
DELETE /api/events?id=X       # Delete event
```

## Database Schema

### Events Table
```sql
- id (serial, primary key)
- name (varchar 255)
- is_active (boolean)
- created_at (timestamp)
- updated_at (timestamp)
```

### Feedback Table
```sql
- id (serial, primary key)
- event_id (integer, foreign key)
- rating (1-5)
- created_at (timestamp)
```

**Indexes**:
- `events.is_active` - for active event lookup
- `feedback.event_id` - for efficient event queries
- `feedback.event_id, rating` - for analytics queries

## Tablet Optimization Tips

### iOS (iPad)
1. Open in Safari
2. Tap Share → Add to Home Screen
3. Use Guided Access to lock the app

### Android (Tablets)
1. Open in Chrome
2. Tap menu → Install app
3. Use App Pinning to lock the app

### Kiosk Mode Features
- Viewport disabled zoom
- User-select optimized for touch
- Landscape/portrait responsive
- No address bar in fullscreen mode

## Real-Time Updates

The tablet polls the `/api/events/current` endpoint every 2 seconds to detect:
- Event name changes
- Event activation

**For Supabase Real-time Alternative**:
If you want to replace polling with Supabase Real-time, refer to `.env.example` for Supabase variables. The current implementation uses simple polling for simplicity.

## Authentication

**Admin Login**:
- Default password: `admin123` (development)
- Production: Generate password hash with:
  ```bash
  node -e "require('bcryptjs').hash('your_password', 10).then(h => console.log(h))"
  ```
- Set `ADMIN_PASSWORD_HASH` in `.env.local`

**JWT Tokens**:
- Issued on login with 24-hour expiry
- Stored in localStorage
- Included in Authorization headers for admin APIs

## Performance Considerations

✅ **Optimized for Scale**:
- Indexed queries for fast lookups
- Connection pooling via postgres library
- Real-time updates via polling (can switch to Supabase)
- Optimized CSS (Tailwind minified)
- Next.js Image Optimization

✅ **Mobile-Optimized**:
- No unnecessary JavaScript
- CSS-based animations
- Minimal bundle size
- Touch-friendly button sizes (min 44x44px)

## Development Workflow

```bash
# Start dev server
npm run dev

# Run database migration
npm run db:migrate

# Build for production
npm build

# Start production server
npm start
```

## Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Self-Hosted
```bash
npm run build
npm start
```

Ensure PostgreSQL is accessible and environment variables are set.

## Troubleshooting

**"No active event" on tablet**:
- Go to `/admin` and activate an event
- Check PostgreSQL is running

**Database connection errors**:
- Verify `DATABASE_URL` is correct
- Ensure PostgreSQL service is running
- Check database exists

**Admin login fails**:
- Verify `ADMIN_PASSWORD_HASH` is set (or use default `admin123`)
- Clear browser cache and localStorage

**Real-time updates delayed**:
- Currently uses 2-second polling, adjust in `FeedbackTablet.tsx`
- Consider Supabase Real-time for instant updates

## Security Notes

⚠️ **Development Mode**:
- Default password is `admin123`
- JWT_SECRET is placeholder

✅ **Production Recommendations**:
- Set strong `ADMIN_PASSWORD_HASH`
- Generate secure `JWT_SECRET`
- Use HTTPS/TLS
- Set `NODE_ENV=production`
- Use environment-specific secrets
- Consider rate limiting on `/api/feedback`

## Future Enhancements

- [ ] Supabase Real-time integration
- [ ] Email notifications for admins
- [ ] Scheduled event reports
- [ ] Multi-language support
- [ ] Custom color themes
- [ ] QR code for analytics sharing
- [ ] Video feedback capture
- [ ] AI sentiment analysis

## License

MIT

## Support

For issues, questions, or suggestions, please create an issue or contact the development team.
