# Ascent XR Business Dashboard

**Mission Control for Ascent XR Business Operations**

A comprehensive dashboard for managing agents, tracking revenue, executing LinkedIn campaigns, and coordinating business operations.

## 🚀 Deploy to Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/your-template-id)

### Manual Deployment

1. **Fork/Connect this repo to Railway:**
   - Go to [railway.app](https://railway.app)
   - New Project → Deploy from GitHub repo
   - Select `AscentXR/AscentXR-Business`

2. **Railway will auto-detect and deploy:**
   - Uses `railway.json` for configuration
   - Runs `server.js` on port 3000
   - Health check at `/health`

3. **Get your URL:**
   - Railway provides a random subdomain
   - Or add a custom domain in Settings

### Environment Variables (Optional)

No env vars required for basic deployment. The dashboard works out of the box.

## 📊 Dashboard Features

- **Agent Coordination**: 20 specialized agents with status tracking
- **Revenue Pipeline**: $300K target tracking
- **LinkedIn Campaigns**: Week 1 & 2 content ready
- **CRM Integration**: HubSpot pipeline management
- **Real-time Metrics**: Task completion, engagement rates
- **Mobile Responsive**: Works on all devices

## 🏗️ Project Structure

```
/
├── dashboard_v18.html      # Main dashboard
├── server.js               # Node.js server
├── railway.json            # Railway config
├── agent_registry.json     # 20 agent configurations
├── linkedin_week1/         # LinkedIn content & images
├── crm/                    # CRM interface
└── shared_assets/          # Shared resources
```

## 📝 Local Development

```bash
# Clone
git clone https://github.com/AscentXR/AscentXR-Business.git
cd AscentXR-Business

# Install (none needed - pure static files)

# Run
node server.js

# Open http://localhost:3000
```

## 🔒 Security

- Sensitive files excluded in `.gitignore`
- .htpasswd not committed
- No API keys in repo

## 📅 Latest Updates

- **v18.4**: Fixed JavaScript null reference errors
- **v18.3**: Fixed updateStats null check
- **v18.2**: Fixed switchView null check
- **v18.1**: Fixed async/await errors, disabled auto-refresh

## 📞 Support

For issues or questions, contact the Main Agent (Sam) via Ascent XR coordination system.

---

**Built with:** HTML, CSS, JavaScript, Chart.js, Node.js
**Deployed on:** Railway.app
