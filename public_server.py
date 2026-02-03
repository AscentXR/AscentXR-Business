#!/usr/bin/env python3
import http.server
import socketserver
import socket
import os
import sys

class PublicHTTPHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        """Custom logging to show external IPs"""
        client_ip = self.client_address[0]
        print(f"{client_ip} - {format % args}")
    
    def end_headers(self):
        """Add headers for CORS and cache control"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

def get_public_ip():
    """Get public IP address"""
    try:
        import urllib.request
        import json
        response = urllib.request.urlopen('http://httpbin.org/ip', timeout=5)
        data = json.loads(response.read().decode())
        return data['origin']
    except:
        return "Unknown"

def main():
    PORT = 9090
    DIRECTORY = os.path.dirname(os.path.abspath(__file__))
    
    # Change to directory
    os.chdir(DIRECTORY)
    
    # Get IP info
    local_ip = socket.gethostbyname(socket.gethostname())
    public_ip = get_public_ip()
    
    print("=" * 70)
    print("AScent XR PUBLIC DASHBOARD SERVER")
    print("=" * 70)
    print(f"📂 Directory: {DIRECTORY}")
    print(f"🔌 Port: {PORT}")
    print("")
    print("🌐 ACCESS URLs:")
    print(f"  Local:     http://localhost:{PORT}/")
    print(f"  Network:   http://{local_ip}:{PORT}/")
    print(f"  Public:    http://{public_ip}:{PORT}/")
    print("")
    print("📋 Direct Links:")
    print(f"  Dashboard: http://{public_ip}:{PORT}/ascent_xr_master_dashboard.html")
    print(f"  Test:      http://{public_ip}:{PORT}/simple_test.html")
    print("")
    print("⚠️  If public IP doesn't work:")
    print("  1. Check firewall: sudo ufw allow 9090/tcp")
    print("  2. Router may block incoming connections")
    print("  3. Try different port (9080, 9091)")
    print("=" * 70)
    
    # Kill any existing server on this port
    try:
        import signal
        import psutil
        for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
            if proc.info['cmdline'] and f':{PORT}' in ' '.join(proc.info['cmdline']):
                os.kill(proc.info['pid'], signal.SIGTERM)
    except:
        pass
    
    # Start server
    try:
        with socketserver.TCPServer(("0.0.0.0", PORT), PublicHTTPHandler) as httpd:
            print(f"✅ Server started successfully!")
            print(f"👂 Listening on 0.0.0.0:{PORT}")
            print("Press Ctrl+C to stop")
            httpd.serve_forever()
    except OSError as e:
        print(f"❌ Failed to start on port {PORT}: {e}")
        print("Trying port 9091...")
        PORT = 9091
        with socketserver.TCPServer(("0.0.0.0", PORT), PublicHTTPHandler) as httpd:
            print(f"✅ Server started on port {PORT}")
            print(f"Access: http://{public_ip}:{PORT}/")
            httpd.serve_forever()

if __name__ == "__main__":
    main()