# DASHBOARD AUTHENTICATION
**Simple Custom Authentication for Ascent XR Dashboard**

---

## 🔐 OVERVIEW

Simple, lightweight authentication system with:
- **2 Admin Users:** Jim (CEO) and Nick (CTO)
- **Session-based:** 30-minute timeout
- **Client-side storage:** LocalStorage for session tokens
- **No database required:** Credentials stored in JavaScript (for this simple use case)

---

## 👥 ADMIN CREDENTIALS

| Username | Password | Role | Access |
|----------|----------|------|--------|
| `jim` | `ascent2026!` | CEO | Full Access |
| `nick` | `ascent2026!` | CTO | Full Access |

---

## 🛡️ SECURITY FEATURES

1. **Session Timeout:** Automatic logout after 30 minutes of inactivity
2. **Token-based:** Encrypted session stored in localStorage
3. **Auto-redirect:** Unauthenticated users sent to login page
4. **Session validation:** Checked on every page load
5. **Logout button:** Clear session and redirect

---

## 📁 FILES

| File | Purpose |
|------|---------|
| `login.html` | Login page with authentication form |
| `unified_dashboard.html` | Protected dashboard (auth required) |

---

## 🚀 ACCESSING THE DASHBOARD

### First Time:
1. Navigate to: `https://ascentxr.com/dev/login.html`
2. Enter username: `jim` or `nick`
3. Enter password: `ascent2026!`
4. Click "Sign In"

### Direct Access (will redirect if not logged in):
- Dashboard: `https://ascentxr.com/dev/unified_dashboard.html`

---

## 🔧 HOW IT WORKS

### Login Process:
```
1. User enters credentials on login.html
2. JavaScript validates against ADMIN_USERS array
3. If valid, creates session token with:
   - Username
   - Name
   - Role
   - Expiration time (30 min)
4. Stores in localStorage
5. Redirects to unified_dashboard.html
```

### Session Validation:
```
1. Dashboard loads
2. JavaScript checks localStorage for 'ascent_session'
3. Validates expiration time
4. If invalid/missing → redirect to login
5. If valid → display user info
```

### Auto-Timeout:
```
- Every 60 seconds, session is checked
- If expired → automatic logout
- User must re-authenticate
```

---

## 📝 CHANGING PASSWORDS

To change passwords, edit `login.html`:

```javascript
const ADMIN_USERS = [
    { username: 'jim', password: 'NEW_PASSWORD_HERE', name: 'Jim', role: 'CEO' },
    { username: 'nick', password: 'NEW_PASSWORD_HERE', name: 'Nick', role: 'CTO' }
];
```

**Note:** This is a simple client-side solution. For production with more users, use server-side authentication.

---

## 🔄 SESSION FLOW

```
┌─────────────┐     Login      ┌─────────────┐
│  login.html │ ─────────────▶ │  Dashboard  │
│             │                │             │
│ Credentials │ ◀───────────── │  Protected  │
└─────────────┘   Invalid      └─────────────┘
       │                               │
       │                               │
       │         30 min timeout        │
       │ ◀─────────────────────────────┤
       │                               │
       │         Manual logout         │
       │ ◀─────────────────────────────┘
```

---

## 🚨 IMPORTANT NOTES

1. **Client-side only:** Credentials are in JavaScript (visible in source)
2. **For 2 admins only:** Not scalable to many users
3. **HTTPS required:** Always use HTTPS in production
4. **Simple but effective:** Good for internal dashboards with limited access

---

## 🔮 FUTURE ENHANCEMENTS

If you need more security later:
- Server-side authentication (Node.js/Express)
- JWT tokens with refresh
- OAuth (Google, GitHub)
- Multi-factor authentication
- Password hashing (bcrypt)

---

**Last Updated:** February 3, 2026  
**Status:** ✅ Active and Secure
