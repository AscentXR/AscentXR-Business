#!/bin/bash
echo "Starting LocalTunnel for Ascent XR Dashboard..."
echo ""

# Kill any existing localtunnel processes
pkill -f "lt --port" 2>/dev/null || true

# Start the dashboard server on port 8080
cd /home/jim/openclaw
python3 -m http.server 8080 --bind 0.0.0.0 > /tmp/dashboard.log 2>&1 &
DASHBOARD_PID=$!

# Wait for server to start
sleep 2

# Start LocalTunnel
echo "🔗 Creating public tunnel..."
lt --port 8080 --subdomain ascent-xr-dashboard 2>&1 | tee /tmp/tunnel.log &
TUNNEL_PID=$!

# Wait for tunnel to establish
sleep 5

echo ""
echo "=============================================="
echo "✅ TUNNEL SETUP COMPLETE"
echo "=============================================="
echo ""
echo "📊 DASHBOARD URLs:"
echo "   Local:      http://localhost:8080/"
echo "   Network:    http://172.22.8.76:8080/"
echo ""
echo "🌐 PUBLIC URL (accessible from anywhere):"
echo "   Will appear below when tunnel is ready..."
echo ""
echo "=============================================="
echo "Waiting for tunnel URL..."
echo ""

# Extract tunnel URL from logs
for i in {1..10}; do
    TUNNEL_URL=$(grep -o "https://[a-zA-Z0-9.-]*\.loca\.lt" /tmp/tunnel.log 2>/dev/null | tail -1)
    if [ -n "$TUNNEL_URL" ]; then
        echo "✅ PUBLIC DASHBOARD URL:"
        echo "   $TUNNEL_URL"
        echo ""
        echo "📋 Direct links:"
        echo "   Dashboard: $TUNNEL_URL/ascent_xr_master_dashboard.html"
        echo "   Test:      $TUNNEL_URL/simple_test.html"
        echo ""
        echo "=============================================="
        break
    fi
    sleep 2
done

# Keep script running
echo "Tunnel is active. Press Ctrl+C to stop."
wait $TUNNEL_PID