#!/usr/bin/env python3
import http.server
import socketserver
import socket
import os

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

def get_ip_address():
    """Get local IP address"""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # doesn't even have to be reachable
        s.connect(('10.255.255.255', 1))
        ip = s.getsockname()[0]
    except Exception:
        ip = '127.0.0.1'
    finally:
        s.close()
    return ip

def main():
    PORT = 8087
    DIRECTORY = os.path.dirname(os.path.abspath(__file__))
    
    # Change to directory
    os.chdir(DIRECTORY)
    
    # Create handler
    handler = MyHTTPRequestHandler
    
    # Try to bind to all interfaces
    for bind_address in ['0.0.0.0', '']:
        try:
            with socketserver.TCPServer((bind_address, PORT), handler) as httpd:
                local_ip = get_ip_address()
                print(f"Serving on:")
                print(f"  Local: http://localhost:{PORT}/")
                print(f"  Network: http://{local_ip}:{PORT}/")
                print(f"  All interfaces: http://0.0.0.0:{PORT}/")
                print(f"Directory: {DIRECTORY}")
                print("Press Ctrl+C to stop")
                
                httpd.serve_forever()
                break
        except OSError as e:
            print(f"Failed to bind to {bind_address}:{PORT} - {e}")
            continue

if __name__ == "__main__":
    main()