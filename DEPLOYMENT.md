# 🚀 Deployment Checklist

Use this checklist before deploying your Feedback Kiosk to production.

---

## Pre-Deployment Checklist

### Code & Build
- [ ] Run `npm run build` - no errors
- [ ] Run `npm run lint` - if you have linting setup
- [ ] All TypeScript types compile correctly
- [ ] No console errors in DevTools
- [ ] Tested all 3 pages (/, /admin, /analytics)

### Security Setup
- [ ] Generated secure admin password hash:
  ```bash
  node -e "require('bcryptjs').hash('your_password', 10).then(h => console.log(h))"
  ```
  - [ ] Set `ADMIN_PASSWORD_HASH` in production environment
  - [ ] Removed default `admin123` password

- [ ] Generated random JWT secret:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
  - [ ] Set `JWT_SECRET` in production environment

- [ ] Set `NODE_ENV=production`

- [ ] Verified no hardcoded secrets in code
  - [ ] No passwords in source
  - [ ] No API keys in source
  - [ ] All secrets in environment variables

### Database
- [ ] Database migration successful: `npm run db:migrate`
- [ ] Database tables exist:
  ```bash
  psql $DATABASE_URL -c "\dt"
  ```
  - [ ] `events` table exists
  - [ ] `feedback` table exists
  - [ ] Indexes created

- [ ] Database connection tested:
  ```bash
  psql $DATABASE_URL -c "SELECT 1"
  ```

- [ ] Database backups configured
- [ ] Database has sufficient capacity
- [ ] Connection pooling configured (if needed)

### Environment Variables
Set these in your production environment:

```
[ ] DATABASE_URL=postgresql://user:password@host:port/db
[ ] JWT_SECRET=your_generated_secret
[ ] ADMIN_PASSWORD_HASH=your_generated_hash
[ ] NODE_ENV=production
```

### Testing on Staging
- [ ] Tablet UI works smoothly
- [ ] Feedback submission successful
- [ ] Admin login works
- [ ] Event creation works
- [ ] Event activation detected within 2 seconds
- [ ] Analytics displaying correctly
- [ ] Real-time polling working
- [ ] Responsive on tablet screen size

### Performance
- [ ] API response times < 200ms:
  ```bash
  time curl http://localhost:3000/api/events/current
  ```

- [ ] Database queries optimized
- [ ] No console warnings
- [ ] No memory leaks
- [ ] Load testing done (if high volume expected)

### Mobile/Tablet
- [ ] Tested on iPad (or 10.1" tablet device)
- [ ] Tested on Android tablet
- [ ] Touch targets work smoothly (min 44x44px)
- [ ] No zoom on input focus
- [ ] Full-screen mode working
- [ ] Orientation changes handled

### Accessibility
- [ ] Color contrast meets WCAG AA
- [ ] Touch targets large enough
- [ ] No keyboard traps
- [ ] Error messages clear

---

## Deployment Process

### Option 1: Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Or link to GitHub and auto-deploy

# Set environment variables in Vercel dashboard:
# - DATABASE_URL
# - JWT_SECRET  
# - ADMIN_PASSWORD_HASH
```

### Option 2: Self-Hosted (VPS/Dedicated Server)

```bash
# On production server:

# 1. Clone repository
git clone <your-repo> feedback-kiosk
cd feedback-kiosk

# 2. Install dependencies
npm install --production

# 3. Build
npm run build

# 4. Set environment variables
export DATABASE_URL=postgresql://...
export JWT_SECRET=...
export ADMIN_PASSWORD_HASH=...
export NODE_ENV=production

# 5. Run database migration
npm run db:migrate

# 6. Start server
npm start

# Or use PM2 for process management:
pm2 start "npm start" --name feedback-kiosk
pm2 startup
pm2 save
```

### Option 3: Docker Deployment

```bash
# Build image
docker build -t feedback-kiosk .

# Run container
docker run -d \
  --name feedback-kiosk \
  -p 3000:3000 \
  -e DATABASE_URL=$DATABASE_URL \
  -e JWT_SECRET=$JWT_SECRET \
  -e ADMIN_PASSWORD_HASH=$ADMIN_PASSWORD_HASH \
  feedback-kiosk
```

---

## Post-Deployment Verification

### Immediate (After Deploy)
- [ ] Site loads without errors
- [ ] Admin page accessible
- [ ] API endpoints responding
- [ ] Database connection working
- [ ] Check server logs for errors

### First Hour
- [ ] Test tablet UI on actual tablet
- [ ] Submit test feedback
- [ ] Verify analytics updating
- [ ] Check real-time event detection
- [ ] Monitor error logs

### First Day
- [ ] Monitor performance metrics
- [ ] Check error logs periodically
- [ ] Test all admin functions
- [ ] Verify backups running
- [ ] Test recovery procedures

### Ongoing
- [ ] Daily: Check error logs
- [ ] Weekly: Review analytics
- [ ] Monthly: Check performance metrics
- [ ] Quarterly: Update dependencies
- [ ] Monthly: Test backup restore

---

## Production Monitoring

### Key Metrics to Monitor
- [ ] Response time (should be < 200ms)
- [ ] Error rate (should be < 0.1%)
- [ ] Database query time
- [ ] API usage/rate
- [ ] Server uptime
- [ ] CPU/Memory usage
- [ ] Disk space

### Logging
- [ ] Server logs configured
- [ ] Error tracking enabled (e.g., Sentry)
- [ ] Analytics tracked
- [ ] Audit logs for admin actions

### Backups
- [ ] Database backup frequency: ________ (daily recommended)
- [ ] Backup retention: ________ days
- [ ] Tested restore process
- [ ] Backup storage location: __________

---

## Scaling Considerations

If you expect:

**< 100 responses/day**: Current setup is fine
- [ ] Single server sufficient
- [ ] Database optimization optional
- [ ] Polling every 2 seconds OK

**100-1,000 responses/day**: Consider:
- [ ] Caching layer (Redis)
- [ ] Database read replicas
- [ ] Reduce polling frequency
- [ ] Monitor disk space

**1,000+ responses/day**: Must implement:
- [ ] Load balancing
- [ ] Database connection pooling
- [ ] Caching strategy
- [ ] Real-time updates (Supabase)
- [ ] CDN for static assets
- [ ] Professional monitoring

---

## Maintenance Schedule

### Daily
```bash
# Check logs for errors
tail -f /var/log/application.log

# Check disk space
df -h
```

### Weekly
```bash
# Update dependencies
npm update

# Check for vulnerabilities
npm audit

# Verify backups completed
ls -la /backup/
```

### Monthly
```bash
# Clean up old logs
find /var/log -name "*.log" -mtime +90 -delete

# Analyze performance
# Check database size
psql $DATABASE_URL -c "SELECT pg_size_pretty(pg_database_size('feedback_kiosk'));"

# Archive old feedback (optional)
# DELETE FROM feedback WHERE created_at < NOW() - INTERVAL '90 days';
```

---

## Troubleshooting Common Issues

### Issue: Site won't load
- [ ] Check server is running: `pm2 status`
- [ ] Check logs: `pm2 logs`
- [ ] Verify DNS configured
- [ ] Check firewall rules

### Issue: Database errors
- [ ] Verify DATABASE_URL is correct
- [ ] Check database is running
- [ ] Verify network connectivity
- [ ] Check database user permissions

### Issue: Slow performance
- [ ] Check server CPU/memory: `top`
- [ ] Analyze database queries
- [ ] Check for connection leaks
- [ ] Consider scaling

### Issue: Admin login fails
- [ ] Verify JWT_SECRET is set
- [ ] Check ADMIN_PASSWORD_HASH is correct
- [ ] Clear browser cache
- [ ] Check server logs

---

## Rollback Procedure

If deployment has issues:

```bash
# 1. Stop current deployment
pm2 stop feedback-kiosk
# or
docker stop feedback-kiosk

# 2. Restore previous version
git checkout <previous-commit>
npm install --production
npm run build

# 3. Restore database if needed
# (from backup)
psql $DATABASE_URL < backup.sql

# 4. Restart
npm start
# or
docker start feedback-kiosk
```

---

## Security After Deployment

- [ ] Enable firewall rules
  - [ ] Block all except port 80/443
  - [ ] Block database port from external

- [ ] Set up HTTPS/SSL
  - [ ] Use Let's Encrypt (free)
  - [ ] Auto-renewal configured

- [ ] Configure CORS if needed
  - [ ] Only allow trusted origins

- [ ] Set security headers
  - [ ] X-Frame-Options
  - [ ] Content-Security-Policy
  - [ ] X-XSS-Protection

- [ ] Monitor for suspicious activity
  - [ ] Track failed login attempts
  - [ ] Monitor unusual traffic patterns

---

## Disaster Recovery

### Backup Strategy
```bash
# Daily database backup
0 2 * * * pg_dump $DATABASE_URL | gzip > /backup/db-$(date +%Y-%m-%d).sql.gz

# Keep 30 days of backups
find /backup -name "*.sql.gz" -mtime +30 -delete
```

### Recovery Test (Monthly)
- [ ] Restore from backup to test database
- [ ] Verify data integrity
- [ ] Document recovery time
- [ ] Update recovery procedures if needed

### Disaster Contact List
- Database provider support: __________________
- Hosting provider support: __________________
- On-call engineer: __________________
- Manager/stakeholder: __________________

---

## Final Sign-Off

**Pre-deployment reviewed by**: _________________ Date: _______

**Deployed by**: ________________________ Date: _______

**Post-deployment verified by**: _________________ Date: _______

**Approved for production**: _________________ Date: _______

---

## Notes

```
Use this space to document deployment-specific notes:

_____________________________________________________________

_____________________________________________________________

_____________________________________________________________

_____________________________________________________________
```

---

**Good luck with your deployment! 🚀**

If issues arise, refer to VERIFICATION.md troubleshooting section.
