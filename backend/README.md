# Backend API Server for Ascent XR Dashboard

## Required Integrations
1. LinkedIn API - OAuth2, post scheduling, webhooks
2. CRM API - Connection to web-production-f0ae1.up.railway.app
3. File Server - Serve documentation files
4. Export API - Create ZIP archives
5. Agent Tracking - Serve real progress data

## Tech Stack
- Express.js for API server
- Axios for HTTP requests
- Multer for file uploads
- Archiver for ZIP creation
- Passport.js for OAuth
- MongoDB for data storage (optional)