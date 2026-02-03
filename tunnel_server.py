#!/usr/bin/env python3
import http.server
import socketserver
import sys
import socket

class TunnelHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.path = '/ascent_xr_master_dashboard.html'
        return super().do_GET()

def get_network_ip():
    """Get network IP address"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return '0.0.0.0'

def main():
    PORT = 9090  # Different port
    
    # Get IP addresses
    network_ip = get_network_ip()
    
    print("=" * 60)
    print("AScent XR Dashboard Tunnel Server")
    print("=" * 60)
    print(f"Dashboard: http://{network_ip}:{PORT}/")
    print(f"Direct file: http://{network_ip}:{PORT}/ascent_xr_master_dashboard.html")
    print(f"Test page: http://{network_ip}:{PORT}/simple_test.html")
    print(f"All interfaces: http://0.0.0.0:{PORT}/")
    print("=" * 60)
    print("If connection fails, try:")
    print("1. Check firewall: sudo ufw allow 9090/tcp")
    print("2. Try different port (9080, 9090, 9099)")
    print("3. Clear browser cache")
    print("=" * 60)
    
    try:
        with socketserver.TCPServer(("0.0.0.0", PORT), TunnelHandler) as httpd:
            httpd.serve_forever()
    except OSError as e:
        print(f"Port {PORT} busy, trying 9099...")
        PORT = 9099
        with socketserver.TCPServer(("0.0.0.0", PORT), TunnelHandler) as httpd:
            print(f"Now running on port {PORT}")
            print(f"Access: http://{network_ip}:{PORT}/")
            httpd.serve_forever()

if __name__ == "__main__":
    main()