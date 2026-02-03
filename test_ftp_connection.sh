#!/bin/bash
# Direct FTP Test Script - Tests Bluehost connection without GitHub Actions
# Usage: ./test_ftp_connection.sh <username> <password>

FTP_USER=${1:-}
FTP_PASS=${2:-}
FTP_HOST="ftp.ascentxr.com"
REMOTE_DIR="/public_html/ascentxr-com/dev/"
LOCAL_DIR="/home/jim/openclaw"

if [ -z "$FTP_USER" ] || [ -z "$FTP_PASS" ]; then
    echo "Usage: ./test_ftp_connection.sh <ftp_username> <ftp_password>"
    exit 1
fi

echo "🧪 Testing FTP Connection to Bluehost..."
echo "=========================================="
echo "Host: $FTP_HOST"
echo "User: $FTP_USER"
echo "Remote Path: $REMOTE_DIR"
echo ""

# Test connection with curl
echo "📡 Testing connection..."
if curl -v "ftp://$FTP_USER:$FTP_PASS@$FTP_HOST$REMOTE_DIR" --ftp-ssl -l 2>&1 | head -20; then
    echo ""
    echo "✅ FTP Connection successful!"
    echo ""
    echo "📋 Files currently on server:"
    curl -s "ftp://$FTP_USER:$FTP_PASS@$FTP_HOST$REMOTE_DIR" --ftp-ssl -l 2>/dev/null
else
    echo ""
    echo "❌ FTP Connection failed"
    echo "Check credentials and ensure FTP is enabled in Bluehost"
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ Connection test complete"
