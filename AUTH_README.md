# DASHBOARD AUTHENTICATION
**Server-Side JWT Authentication for Ascent XR Dashboard**

---

## OVERVIEW

Secure server-side authentication system with:
- **2 Admin Users:** Jim (CEO) and Nick (CTO)
- **JWT-based:** Tokens with 30-minute expiration
- **Server-side validation:** Credentials stored as bcrypt hashes in environment variables
- **Rate limiting:** Brute force protection (5 attempts per 15 minutes)

---

## ADMIN CREDENTIALS

Credentials are stored securely as bcrypt hashes in `.env` file (never committed to git).

| Username | Role | Access |
|----------|------|--------|
| `jim` | CEO | Full Access (Revenue-first dashboard view) |
| `nick` | CTO | Full Access (Tech-first dashboard view) |

**To set passwords:** Run `node -e "const bcrypt=require('bcrypt'); bcrypt.hash('YOUR_PASSWORD', 12).then(h => console.log(h))"` and add the hash to `.env`.

---

## SECURITY FEATURES

1. **JWT Tokens:** Signed with RS256/HS256, 30-minute expiration
2. **Bcrypt Hashing:** Passwords hashed with cost factor 12
3. **Rate Limiting:** 5 login attempts per 15 minutes per IP
4. **HTTP-Only Cookies:** Optional secure cookie transport
5. **CORS Protection:** Restricted to allowed origins
6. **Helmet.js:** Security headers on all responses
7. **Auto-redirect:** Unauthenticated users sent to login page
8. **Session validation:** JWT verified on every API request

---

## FILES

| File | Purpose |
|------|---------|
| `login.html` | Login page (sends POST to `/api/auth/login`) |
| `backend/middleware/auth.js` | JWT verification middleware |
| `backend/routes/auth.js` | Authentication endpoints |
| `dashboard_v19.html` | Protected dashboard (auth required) |
| `.env` | Credential hashes (never committed) |

---

## API ENDPOINTS

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Authenticate with username/password, returns JWT |
| `POST` | `/api/auth/logout` | Invalidate current session |
| `GET` | `/api/auth/session` | Verify current JWT and return user info |

---

## ACCESSING THE DASHBOARD

### First Time:
1. Navigate to: `https://ascentxr.com/dev/login.html`
2. Enter your username and password
3. Click "Sign In"
4. You'll be redirected to the dashboard based on your role

### Direct Access (will redirect if not logged in):
- Dashboard: `https://ascentxr.com/dev/dashboard_v19.html`

---

## HOW IT WORKS

### Login Process:
```
1. User enters credentials on login.html
2. Frontend sends POST /api/auth/login with username/password
3. Server validates against bcrypt hashes from .env
4. If valid, server returns signed JWT token
5. Frontend stores token in localStorage
6. Redirects to role-appropriate dashboard view
```

### API Authentication:
```
1. Client includes JWT in Authorization: Bearer <token> header
2. auth middleware verifies token signature and expiration
3. If invalid/expired -> 401 Unauthorized
4. If valid -> request proceeds, req.user populated
```

---

## ENVIRONMENT SETUP

Copy `.env.example` to `.env` and set your password hashes:

```bash
cp backend/.env.example backend/.env
# Generate password hashes:
node -e "const bcrypt=require('bcrypt'); bcrypt.hash('your_password', 12).then(h => console.log(h))"
# Add the hashes to .env as ADMIN_JIM_HASH and ADMIN_NICK_HASH
```

---

## FUTURE ENHANCEMENTS

- OAuth (Google, GitHub) integration
- Multi-factor authentication
- Refresh token rotation
- Audit logging for all auth events

---

**Last Updated:** February 8, 2026
**Status:** Active - Server-Side JWT Authentication
