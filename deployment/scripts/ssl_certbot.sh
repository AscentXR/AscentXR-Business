#!/bin/bash

# SSL Certificate Automation Script for Ascent XR Dashboard
# This script automates Let's Encrypt certificate generation and renewal

set -e

# Configuration
DOMAIN="ascent-xr.local"
EMAIL="admin@ascent-xr.local"
CERTBOT_OPTS="--non-interactive --agree-tos --email ${EMAIL}"
WEBROOT_PATH="/var/www/html"
SSL_PATH="/etc/nginx/ssl"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} ERROR: $1" >&2
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} WARNING: $1"
}

# Check if certbot is installed
check_certbot() {
    if ! command -v certbot &> /dev/null; then
        log "Installing certbot..."
        apt-get update
        apt-get install -y certbot python3-certbot-nginx
    fi
}

# Create directory structure
create_dirs() {
    log "Creating SSL directory structure..."
    mkdir -p ${SSL_PATH}/live/${DOMAIN}
    mkdir -p ${SSL_PATH}/archive/${DOMAIN}
    mkdir -p ${SSL_PATH}/renewal
    mkdir -p ${WEBROOT_PATH}
}

# Generate initial certificates
generate_certificates() {
    log "Generating SSL certificates for ${DOMAIN}..."
    
    # Use standalone mode for initial certificate (requires port 80/443 to be free)
    certbot certonly --standalone ${CERTBOT_OPTS} \
        -d ${DOMAIN} \
        --preferred-challenges http \
        --cert-path ${SSL_PATH}/live/${DOMAIN}/cert.pem \
        --key-path ${SSL_PATH}/live/${DOMAIN}/privkey.pem \
        --fullchain-path ${SSL_PATH}/live/${DOMAIN}/fullchain.pem \
        --chain-path ${SSL_PATH}/live/${DOMAIN}/chain.pem
    
    if [ $? -eq 0 ]; then
        log "Certificates generated successfully!"
        
        # Set proper permissions
        chmod 644 ${SSL_PATH}/live/${DOMAIN}/*.pem
        chmod 600 ${SSL_PATH}/live/${DOMAIN}/privkey.pem
        
        # Create symlinks for Nginx
        ln -sf ${SSL_PATH}/live/${DOMAIN}/fullchain.pem ${SSL_PATH}/fullchain.pem
        ln -sf ${SSL_PATH}/live/${DOMAIN}/privkey.pem ${SSL_PATH}/privkey.pem
        
        log "Symlinks created for Nginx configuration"
    else
        error "Failed to generate certificates"
        exit 1
    fi
}

# Set up automatic renewal
setup_renewal() {
    log "Setting up automatic certificate renewal..."
    
    # Create renewal configuration
    cat > /etc/cron.d/certbot-renewal << EOF
# Auto-renew SSL certificates every Monday at 3 AM
0 3 * * 1 root certbot renew --quiet --post-hook "systemctl reload nginx"
EOF
    
    # Test renewal
    log "Testing certificate renewal..."
    certbot renew --dry-run
    
    if [ $? -eq 0 ]; then
        log "Renewal configuration tested successfully"
    else
        warn "Renewal test failed, check configuration"
    fi
}

# Create Nginx SSL configuration
create_nginx_config() {
    log "Creating Nginx SSL configuration..."
    
    cat > ${SSL_PATH}/ssl_params.conf << 'EOF'
# SSL configuration parameters
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;

ssl_session_cache shared:SSL:10m;
ssl_session_timeout 1d;
ssl_session_tickets off;

ssl_stapling on;
ssl_stapling_verify on;

resolver 1.1.1.1 8.8.8.8 valid=300s;
resolver_timeout 5s;

add_header Strict-Transport-Security "max-age=63072000" always;
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
EOF
    
    log "Nginx SSL configuration created"
}

# Generate self-signed certificate for development (fallback)
generate_self_signed() {
    log "Generating self-signed certificate for development..."
    
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout ${SSL_PATH}/privkey.pem \
        -out ${SSL_PATH}/fullchain.pem \
        -subj "/C=US/ST=State/L=City/O=Ascent XR/CN=${DOMAIN}"
    
    chmod 644 ${SSL_PATH}/fullchain.pem
    chmod 600 ${SSL_PATH}/privkey.pem
    
    log "Self-signed certificate generated for development use"
}

# Check certificate expiration
check_certificate_expiry() {
    if [ -f "${SSL_PATH}/fullchain.pem" ]; then
        local expiry_date=$(openssl x509 -in ${SSL_PATH}/fullchain.pem -enddate -noout | cut -d= -f2)
        local days_remaining=$(( ($(date -d "${expiry_date}" +%s) - $(date +%s)) / 86400 ))
        
        log "Certificate expires on: ${expiry_date}"
        log "Days remaining: ${days_remaining}"
        
        if [ ${days_remaining} -lt 30 ]; then
            warn "Certificate expires in less than 30 days!"
            return 1
        fi
    else
        warn "No certificate found"
        return 2
    fi
}

# Main execution
main() {
    local action="${1:-generate}"
    
    case "${action}" in
        "generate")
            check_certbot
            create_dirs
            generate_certificates
            setup_renewal
            create_nginx_config
            ;;
        "renew")
            certbot renew ${CERTBOT_OPTS} --post-hook "systemctl reload nginx"
            ;;
        "check")
            check_certificate_expiry
            ;;
        "self-signed")
            create_dirs
            generate_self_signed
            ;;
        *)
            echo "Usage: $0 {generate|renew|check|self-signed}"
            exit 1
            ;;
    esac
    
    log "SSL setup completed successfully!"
}

# Run main function
main "$@"