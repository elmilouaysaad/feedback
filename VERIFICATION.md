# Setup Verification & Troubleshooting

This guide helps you verify your Feedback Kiosk installation and troubleshoot common issues.

## ✅ Pre-Flight Checklist

### 1. Environment Setup
```bash
# Verify Node.js version (should be 18+)
node --version

# Verify npm
npm --version

# Check dependencies installed
npm list

# Verify .env.local exists
ls -la .env.local
```

### 2. Environment Variables
Verify `.env.local` contains:
```env
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret_here
```

**Generate safe values:**
```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Test database connection
psql $DATABASE_URL -c "SELECT 1"
```

### 3. Database Verification

```bash
# Connect to database
psql $DATABASE_URL

# In psql, run:
\dt                    # List tables (should show: events, feedback)
SELECT * FROM events;  # Should see default "Welcome Event"
SELECT COUNT(*) FROM feedback;  # May be 0
\q                     # Exit
```

### 4. Build Verification

```bash
# Clean build
rm -rf .next

# Build project
npm run build

# Check for errors - should end with "✓ Compiled successfully"
```

---

## 🚀 Testing Checklist

### Test 1: Development Server
```bash
npm run dev
# Should output: ▲ Next.js 14.x.x
#                - Local: http://localhost:3000
```

### Test 2: Tablet UI (/)
1. Open http://localhost:3000 in browser
2. Should see:
   - Full-screen dark background
   - 5 colored feedback buttons
   - "How was your experience?" heading
   - Current event name displayed

### Test 3: Submit Feedback
1. Click any button (e.g., "Great" - green)
2. Should see "Thank You!" message
3. Message should disappear after 3 seconds
4. Should return to feedback buttons

### Test 4: Admin Login (/admin)
1. Go to http://localhost:3000/admin
2. Enter password: `admin123`
3. Click "Login"
4. Should see admin dashboard

### Test 5: Event Creation
In admin dashboard:
1. Enter event name (e.g., "Test Event")
2. Click "Create"
3. New event should appear in list

### Test 6: Event Activation
1. Click "Activate" on any event
2. Button should change to "Active" (green)
3. Go to tablet UI (/)
4. Event name should update within 2 seconds

### Test 7: Public Analytics (/analytics)
1. Go to http://localhost:3000/analytics
2. Should see event statistics
3. Should show feedback counts
4. Stats should auto-update every 5 seconds

### Test 8: Real-time Event Detection
1. Open tablet in one window: http://localhost:3000
2. Open admin in another: http://localhost:3000/admin
3. Activate different event in admin
4. Tablet should detect change within 2 seconds

---

## 🔍 Detailed Troubleshooting

### Database Issues

#### ❌ "Cannot connect to database"
**Symptoms**: Red error on page load

**Solution**:
```bash
# Verify DATABASE_URL format
echo $DATABASE_URL
# Should be: postgresql://user:password@host:port/dbname

# Test connection
psql $DATABASE_URL -c "SELECT 1"

# If fails, check:
# 1. PostgreSQL is running: ps aux | grep postgres
# 2. Database exists: createdb feedback_kiosk
# 3. Credentials are correct
# 4. Host is accessible (especially for cloud databases)
```

#### ❌ "Database tables don't exist"
**Symptoms**: Error like "relation events does not exist"

**Solution**:
```bash
npm run db:migrate

# Verify tables created
psql $DATABASE_URL -c "\dt"
```

#### ❌ Migration script fails
**Symptoms**: Error running npm run db:migrate

**Solution**:
```bash
# Check database permissions
psql $DATABASE_URL -c "CREATE TABLE test (id SERIAL);"
psql $DATABASE_URL -c "DROP TABLE test;"

# Check schema.sql syntax
cat database/schema.sql

# Try manual migration
psql $DATABASE_URL < database/schema.sql
```

### Authentication Issues

#### ❌ "Admin login fails"
**Symptoms**: "Invalid password" even with correct password

**Solution**:
```bash
# In development, default is: admin123
# Verify JWT_SECRET is set in .env.local
echo $JWT_SECRET

# Check browser localStorage
# Open DevTools → Application → Local Storage → http://localhost:3000
# Should have: adminToken

# Clear and retry
# Open DevTools → Application → Clear Storage
```

#### ❌ "Session lost after page refresh"
**Symptoms**: Get redirected to login

**Solution**:
```bash
# Verify token is stored in localStorage
# Check browser DevTools → Application → Local Storage

# Verify JWT_SECRET is consistent
# Changing JWT_SECRET invalidates all tokens
```

### Performance Issues

#### ❌ "Tablet updates slow (> 5 seconds)"
**Current**: 2-second polling

**Solution**:
```javascript
// In app/components/FeedbackTablet.tsx
// Line ~35: Change polling interval
setInterval(() => { ... }, 2000); // Reduce for faster updates
```

**Future**: Implement Supabase Real-time for instant updates

#### ❌ "Analytics page slow"
**Symptoms**: Takes > 2 seconds to load

**Solution**:
```bash
# Check database query performance
psql $DATABASE_URL -c "EXPLAIN ANALYZE
SELECT * FROM feedback WHERE event_id = 1
GROUP BY rating;"

# Verify indexes exist
psql $DATABASE_URL -c "\di" | grep feedback
# Should show: idx_feedback_event_rating, idx_feedback_event_id
```

### UI Issues

#### ❌ "Buttons too small on tablet"
**Symptoms**: Hard to tap

**Solution**:
Edit `app/components/FeedbackTablet.tsx`:
```tsx
// Increase button size
<div className="w-32 h-32 md:w-40 md:h-40"> {/* Change from w-24 h-24 */}
```

#### ❌ "Text too small on large screen"
**Symptoms**: Hard to read

**Solution**:
Edit `tailwind.config.ts`:
```ts
fontSize: {
  '7xl': '5rem',  // Increase sizes
  '8xl': '7rem',
}
```

#### ❌ "Mobile/responsive issues"
**Solution**:
```bash
# Test different screen sizes
# DevTools → Device Toolbar
# Select iPad or custom 1024x768

# Edit breakpoints in Tailwind config
# md: → md:@media (min-width: 768px)
# lg: → lg:@media (min-width: 1024px)
```

### API Issues

#### ❌ "API endpoints return 500 errors"
**Solution**:
```bash
# Check server logs (npm run dev terminal)
# Look for error stack traces

# Test endpoint manually
curl http://localhost:3000/api/events/current -v

# Check request headers
# DevTools → Network tab → Select request → Headers
```

#### ❌ "CORS errors"
**Symptoms**: XMLHttpRequest blocked by CORS

**Current**: Not applicable (same origin)

**Future**: If splitting frontend/backend:
```ts
// Add to API route
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
};
```

---

## 🧪 Advanced Testing

### Load Testing
```bash
# Install artillery
npm install -g artillery

# Create test.yml
cat > test.yml << 'EOF'
config:
  target: http://localhost:3000
  phases:
    - duration: 60
      arrivalRate: 10

scenarios:
  - name: Feedback Submission
    flow:
      - post:
          url: /api/feedback
          json:
            rating: 5
EOF

# Run load test
artillery run test.yml
```

### Database Performance
```bash
# Check slow queries
psql $DATABASE_URL -c "
SELECT query, mean_time, calls FROM pg_stat_statements
WHERE query LIKE '%feedback%'
ORDER BY mean_time DESC;
"

# Analyze query plan
psql $DATABASE_URL -c "
EXPLAIN ANALYZE
SELECT e.id, e.name, COUNT(f.id) as total_votes
FROM events e
LEFT JOIN feedback f ON e.id = f.event_id
GROUP BY e.id;
"
```

---

## 📋 System Information Collection

For debugging, gather this info:

```bash
# Save system info
cat > DEBUG_INFO.txt << 'EOF'
=== System ===
Node.js: $(node --version)
npm: $(npm --version)
OS: $(uname -a)

=== Project ===
Next.js: $(npm list next | head -1)
React: $(npm list react | head -1)
postgres pkg: $(npm list postgres | head -1)

=== Environment ===
DATABASE_URL format: $(echo $DATABASE_URL | sed 's/:.*@/:[PASSWORD]@/')
JWT_SECRET: $([ -z "$JWT_SECRET" ] && echo "NOT SET" || echo "SET")

=== Database ===
Tables: $(psql $DATABASE_URL -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';")
Indexes: $(psql $DATABASE_URL -t -c "SELECT count(*) FROM pg_indexes WHERE schemaname = 'public';")
EOF

cat DEBUG_INFO.txt
```

---

## ✅ Success Criteria

Your installation is working correctly when:

- [ ] `npm run dev` starts without errors
- [ ] http://localhost:3000 loads the tablet UI
- [ ] Feedback submission works (shows "Thank You!")
- [ ] http://localhost:3000/admin loads with login form
- [ ] Admin login succeeds with `admin123`
- [ ] Event creation works
- [ ] Event activation updates tablet UI within 2 seconds
- [ ] Analytics page loads and shows data
- [ ] Analytics update every 5 seconds

---

## 📞 Getting Help

If you're stuck:

1. **Check logs**:
   ```bash
   # Terminal where npm run dev is running
   # Look for error messages
   ```

2. **Check browser console**:
   ```
   DevTools → Console → Look for JavaScript errors
   ```

3. **Check database**:
   ```bash
   psql $DATABASE_URL -c "SELECT * FROM events;"
   psql $DATABASE_URL -c "SELECT COUNT(*) FROM feedback;"
   ```

4. **Review this guide**:
   - Search for your symptom
   - Check troubleshooting section
   - Review sample solutions

5. **Reset everything**:
   ```bash
   # Clear database
   psql $DATABASE_URL < database/schema.sql
   
   # Clear Node cache
   rm -rf node_modules .next
   npm install
   
   # Clear browser data
   DevTools → Application → Clear Storage
   
   # Restart dev server
   npm run dev
   ```

---

## 🎯 Next Steps

Once everything is working:

1. **Customize branding**: Edit colors in `tailwind.config.ts`
2. **Set production password**: Update `ADMIN_PASSWORD_HASH`
3. **Deploy to production**: Follow Vercel deployment guide
4. **Test on real tablet**: Install on actual device
5. **Configure kiosk mode**: iPad Guided Access or Android App Pinning
6. **Monitor performance**: Check analytics regularly

Good luck! 🚀
