# 📊 ASCENT XR DASHBOARD ACCESS FOR NICK

**Dashboard URL:** Currently running internally at `http://192.168.5.206:8087/`

## 🔧 **ACCESS OPTIONS FOR EXTERNAL NETWORK:**

### **Option 1: Port Forwarding (Recommended)**
Run these commands in **Windows PowerShell (Admin)**:
```powershell
# Forward WSL port to Windows
netsh interface portproxy add v4tov4 listenport=8087 listenaddress=0.0.0.0 connectport=8087 connectaddress=172.22.8.76

# Allow through Windows Firewall
netsh advfirewall firewall add rule name="Ascent XR Dashboard" dir=in action=allow protocol=TCP localport=8087

# Verify forwarding
netsh interface portproxy show all
```

**After port forwarding:** Nick can access via:
- `http://[YOUR_PUBLIC_IP]:8087/` 
- `http://[YOUR_COMPUTER_NAME]:8087/`

### **Option 2: Cloudflare Tunnel (Zero Trust)**
```bash
# Install Cloudflare Tunnel
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared.deb

# Authenticate (requires Cloudflare account)
cloudflared tunnel login

# Create and run tunnel
cloudflared tunnel create ascent-xr-dashboard
cloudflared tunnel route dns ascent-xr-dashboard dashboard.ascentxr.com
cloudflared tunnel run ascent-xr-dashboard
```

**Result:** Nick accesses `https://dashboard.ascentxr.com`

### **Option 3: ngrok (Quickest)**
```bash
# Install ngrok
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt update && sudo apt install ngrok

# Start tunnel (requires ngrok account)
ngrok http 8087
```

**Result:** Nick gets a public URL like `https://abc123.ngrok.io`

### **Option 4: SSH Tunnel (Most Secure)**
```bash
# On your machine (if you have SSH server running):
# Allow port 22 through firewall

# Nick runs on his machine:
ssh -L 8087:localhost:8087 jim@your-public-ip -N
```

**Then Nick accesses:** `http://localhost:8087/` on his own machine

## 🌐 **FIND YOUR PUBLIC IP:**
```bash
# Run in Windows CMD or PowerShell:
curl ifconfig.me
# Or:
nslookup myip.opendns.com resolver1.opendns.com
```

## 🎯 **RECOMMENDED APPROACH:**

### **Immediate (Tonight):**
1. **Port forward** using PowerShell commands above
2. **Share your public IP** with Nick
3. **Test access** from your phone (cellular data, not WiFi)

### **Long-term (This Week):**
1. **Set up ngrok** for reliable public access
2. **Create subdomain** like `dashboard.ascentxr.com`
3. **Add basic auth** for security

## 🔐 **SECURITY CONSIDERATIONS:**

### **Basic Auth (Quick Security):**
```bash
# Install apache2-utils
sudo apt install apache2-utils

# Create password file
sudo htpasswd -c /etc/nginx/.htpasswd nick

# Add to nginx config (if using nginx)
location / {
    auth_basic "Ascent XR Dashboard";
    auth_basic_user_file /etc/nginx/.htpasswd;
}
```

### **Firewall Rules:**
```powershell
# Restrict to Nick's IP (if static):
netsh advfirewall firewall add rule name="Nick Dashboard" dir=in action=allow protocol=TCP localport=8087 remoteip=192.168.1.100
```

## 📱 **DASHBOARD LINKS:**

### **Current Internal URLs:**
- **Main Dashboard:** `http://192.168.5.206:8087/`
- **Advanced Version:** `http://192.168.5.206:8087/ascent_xr_dashboard_advanced.html`
- **Dark Mode:** `http://192.168.5.206:8087/ascent_xr_dashboard_dark_with_ai.html`
- **Dashboard Hub:** `http://192.168.5.206:8087/index.html`

### **After Port Forwarding:**
Replace `192.168.5.206` with your **public IP** or **domain name**.

## 🚨 **TROUBLESHOOTING:**

### **If Nick Can't Connect:**
1. **Check firewall:** `netsh advfirewall firewall show rule name="Ascent XR Dashboard"`
2. **Verify port open:** `telnet your-public-ip 8087` (from external network)
3. **Test locally first:** `curl http://localhost:8087/` (on your machine)
4. **Check WSL network:** `wsl --shutdown` then restart

### **Common Issues:**
- **Windows Defender blocking:** Add exception for port 8087
- **Router blocking:** May need port forwarding on router too
- **ISP blocking:** Some ISPs block inbound ports

## 📋 **QUICK SETUP CHECKLIST:**

- [ ] Run PowerShell port forwarding commands
- [ ] Find your public IP
- [ ] Test from phone (cellular network)
- [ ] Share URL with Nick
- [ ] Set up basic auth if needed
- [ ] Document access credentials

## 💬 **MESSAGE TO SHARE WITH NICK:**

"Hey Nick! The Ascent XR dashboard is live at `http://[PUBLIC-IP]:8087/`

**Features:**
- Real-time task tracking
- Revenue pipeline visualization  
- AI agent status monitoring
- Week 1 progress tracking
- Dark mode available

**Login:** [Add if you set up auth]

**Best viewed in Chrome/Firefox.** Let me know if you have access issues!"

---

**Technical Contact:** Ascent Assistant  
**Dashboard Version:** Advanced (v1.0)  
**Last Updated:** January 31, 2026  
**Next Maintenance:** Weekly restart recommended