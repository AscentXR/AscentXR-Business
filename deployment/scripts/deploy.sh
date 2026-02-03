#!/bin/bash

# Ascent XR Dashboard Deployment Script
# Automated deployment and update script

set -e

# Configuration
DEPLOYMENT_DIR="/home/jim/openclaw/deployment"
BACKEND_DIR="/home/jim/openclaw/backend"
COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env"
BACKUP_BEFORE_DEPLOY=true
SERVICE_NAME="ascent-xr-dashboard"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} ERROR: $1" >&2
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} WARNING: $1"
}

info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} INFO: $1"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed"
        exit 1
    fi
    log "  ✓ Docker is installed"
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        # Try docker compose (v2)
        if ! docker compose version &> /dev/null; then
            error "Docker Compose is not installed"
            exit 1
        fi
        COMPOSE_CMD="docker compose"
    else
        COMPOSE_CMD="docker-compose"
    fi
    log "  ✓ Docker Compose is available"
    
    # Check if in deployment directory
    if [ ! -f "${DEPLOYMENT_DIR}/${COMPOSE_FILE}" ]; then
        error "Docker Compose file not found in ${DEPLOYMENT_DIR}"
        exit 1
    fi
    log "  ✓ Deployment directory found"
    
    # Check environment file
    if [ ! -f "${DEPLOYMENT_DIR}/${ENV_FILE}" ]; then
        warn "Environment file ${ENV_FILE} not found, using example file"
        cp "${DEPLOYMENT_DIR}/.env.example" "${DEPLOYMENT_DIR}/${ENV_FILE}"
        warn "Please edit ${DEPLOYMENT_DIR}/${ENV_FILE} with your configuration"
    fi
    log "  ✓ Environment configuration ready"
}

# Backup before deployment
create_backup() {
    if [ "${BACKUP_BEFORE_DEPLOY}" = true ]; then
        log "Creating backup before deployment..."
        
        if [ -f "${DEPLOYMENT_DIR}/scripts/backup.sh" ]; then
            "${DEPLOYMENT_DIR}/scripts/backup.sh" backup
        else
            warn "Backup script not found, skipping backup"
        fi
    fi
}

# Build Docker images
build_images() {
    log "Building Docker images..."
    
    cd "${DEPLOYMENT_DIR}"
    
    # Build main dashboard image
    log "  Building dashboard image..."
    docker build -t ascent-xr-dashboard:latest .
    
    # Pull other images
    log "  Pulling required images..."
    docker pull nginx:alpine
    docker pull prom/prometheus:latest
    docker pull grafana/grafana:latest
    
    log "  ✓ All images built/pulled successfully"
}

# Stop existing services
stop_services() {
    log "Stopping existing services..."
    
    cd "${DEPLOYMENT_DIR}"
    
    if [ -f "${COMPOSE_FILE}" ]; then
        ${COMPOSE_CMD} down --remove-orphans
        log "  ✓ Services stopped"
    else
        warn "Compose file not found, skipping service stop"
    fi
}

# Start services
start_services() {
    log "Starting services..."
    
    cd "${DEPLOYMENT_DIR}"
    
    # Start services in detached mode
    ${COMPOSE_CMD} up -d
    
    log "  ✓ Services started"
    
    # Wait for services to be healthy
    wait_for_services
}

# Wait for services to be healthy
wait_for_services() {
    log "Waiting for services to be healthy..."
    
    local timeout=300  # 5 minutes
    local interval=10
    local elapsed=0
    
    while [ ${elapsed} -lt ${timeout} ]; do
        # Check dashboard health
        if curl -s http://localhost:3000/api/health | grep -q '"status":"ok"'; then
            log "  ✓ Dashboard is healthy"
            break
        fi
        
        info "  Waiting for dashboard... (${elapsed}s/${timeout}s)"
        sleep ${interval}
        elapsed=$((elapsed + interval))
    done
    
    if [ ${elapsed} -ge ${timeout} ]; then
        error "Dashboard failed to become healthy within ${timeout} seconds"
        show_service_logs
        exit 1
    fi
    
    # Check Nginx
    if curl -s http://localhost:80 > /dev/null 2>&1; then
        log "  ✓ Nginx is responding"
    else
        warn "  Nginx is not responding on port 80"
    fi
    
    # Check Prometheus
    if curl -s http://localhost:9090/-/healthy > /dev/null 2>&1; then
        log "  ✓ Prometheus is healthy"
    else
        warn "  Prometheus may not be healthy"
    fi
    
    # Check Grafana
    if curl -s http://localhost:3001/api/health | grep -q '"database":"ok"'; then
        log "  ✓ Grafana is healthy"
    else
        warn "  Grafana may not be fully initialized"
    fi
}

# Show service logs for debugging
show_service_logs() {
    log "Showing service logs for debugging..."
    
    cd "${DEPLOYMENT_DIR}"
    
    echo ""
    echo "=== Dashboard Logs ==="
    ${COMPOSE_CMD} logs dashboard --tail=50 || true
    
    echo ""
    echo "=== Nginx Logs ==="
    ${COMPOSE_CMD} logs nginx --tail=50 || true
    
    echo ""
    echo "=== Prometheus Logs ==="
    ${COMPOSE_CMD} logs prometheus --tail=50 || true
    
    echo ""
    echo "=== Grafana Logs ==="
    ${COMPOSE_CMD} logs grafana --tail=50 || true
}

# Generate SSL certificates (if needed)
setup_ssl() {
    log "Setting up SSL certificates..."
    
    if [ -f "${DEPLOYMENT_DIR}/scripts/ssl_certbot.sh" ]; then
        # Check if certificates already exist
        if [ -f "${DEPLOYMENT_DIR}/nginx/ssl/fullchain.pem" ] && \
           [ -f "${DEPLOYMENT_DIR}/nginx/ssl/privkey.pem" ]; then
            log "  ✓ SSL certificates already exist"
        else
            warn "SSL certificates not found, generating self-signed certificates"
            "${DEPLOYMENT_DIR}/scripts/ssl_certbot.sh" self-signed
        fi
    else
        warn "SSL script not found, skipping SSL setup"
    fi
}

# Setup monitoring
setup_monitoring() {
    log "Setting up monitoring..."
    
    # Create monitoring directories
    mkdir -p "${DEPLOYMENT_DIR}/monitoring/prometheus_data"
    mkdir -p "${DEPLOYMENT_DIR}/monitoring/grafana_data"
    
    # Set permissions
    chmod 755 "${DEPLOYMENT_DIR}/monitoring"
    chmod 755 "${DEPLOYMENT_DIR}/monitoring/prometheus_data"
    chmod 755 "${DEPLOYMENT_DIR}/monitoring/grafana_data"
    
    log "  ✓ Monitoring directories created"
}

# Verify deployment
verify_deployment() {
    log "Verifying deployment..."
    
    local checks_passed=0
    local checks_total=4
    
    # Check 1: Dashboard API
    if curl -s http://localhost:3000/api/health | grep -q '"status":"ok"'; then
        log "  ✓ Dashboard API is responding"
        checks_passed=$((checks_passed + 1))
    else
        error "  ✗ Dashboard API is not responding"
    fi
    
    # Check 2: Nginx
    if curl -s -I http://localhost:80 | grep -q "HTTP"; then
        log "  ✓ Nginx is serving traffic"
        checks_passed=$((checks_passed + 1))
    else
        warn "  ✗ Nginx may not be serving traffic"
    fi
    
    # Check 3: Prometheus
    if curl -s http://localhost:9090/-/healthy > /dev/null 2>&1; then
        log "  ✓ Prometheus is healthy"
        checks_passed=$((checks_passed + 1))
    else
        warn "  ✗ Prometheus may not be healthy"
    fi
    
    # Check 4: Grafana
    if curl -s http://localhost:3001/api/health | grep -q '"database":"ok"'; then
        log "  ✓ Grafana is healthy"
        checks_passed=$((checks_passed + 1))
    else
        warn "  ✗ Grafana may not be fully initialized"
    fi
    
    # Summary
    if [ ${checks_passed} -eq ${checks_total} ]; then
        log "✓ All ${checks_total} checks passed!"
    else
        warn "${checks_passed}/${checks_total} checks passed"
    fi
}

# Show deployment information
show_deployment_info() {
    echo ""
    echo "=========================================="
    echo "      ASCENT XR DASHBOARD DEPLOYED       "
    echo "=========================================="
    echo ""
    echo "Services:"
    echo "  Dashboard:      http://localhost:3000"
    echo "  Nginx:          http://localhost:80"
    echo "  Prometheus:     http://localhost:9090"
    echo "  Grafana:        http://localhost:3001"
    echo ""
    echo "API Endpoints:"
    echo "  Health:         http://localhost:3000/api/health"
    echo "  LinkedIn API:   http://localhost:3000/api/linkedin"
    echo "  CRM API:        http://localhost:3000/api/crm"
    echo "  Documents API:  http://localhost:3000/api/documents"
    echo ""
    echo "Monitoring:"
    echo "  Prometheus UI:  http://localhost:9090"
    echo "  Grafana UI:     http://localhost:3001"
    echo "    Username:     admin"
    echo "    Password:     (check .env file)"
    echo ""
    echo "Management Commands:"
    echo "  View logs:      docker-compose logs -f"
    echo "  Stop services:  docker-compose down"
    echo "  Restart:        docker-compose restart"
    echo "  Update:         ./deploy.sh update"
    echo ""
    echo "Backup:"
    echo "  Run backup:     ./scripts/backup.sh backup"
    echo "  Verify backup:  ./scripts/backup.sh verify"
    echo ""
    echo "SSL Setup:"
    echo "  Generate certs: ./scripts/ssl_certbot.sh generate"
    echo "  Check certs:    ./scripts/ssl_certbot.sh check"
    echo ""
    echo "=========================================="
}

# Update existing deployment
update_deployment() {
    log "Updating existing deployment..."
    
    cd "${DEPLOYMENT_DIR}"
    
    # Pull latest code (if using git)
    if [ -d "${BACKEND_DIR}/.git" ]; then
        log "  Pulling latest code..."
        cd "${BACKEND_DIR}"
        git pull origin main
        cd "${DEPLOYMENT_DIR}"
    fi
    
    # Rebuild and restart
    build_images
    ${COMPOSE_CMD} up -d --force-recreate --build dashboard
    
    # Wait for services
    wait_for_services
    
    log "  ✓ Deployment updated successfully"
}

# Rollback to previous version
rollback_deployment() {
    local backup_file="$1"
    
    if [ -z "${backup_file}" ]; then
        error "Please specify backup file to rollback to"
        echo "Usage: $0 rollback /path/to/backup.tar.gz"
        exit 1
    fi
    
    log "Rolling back deployment from backup: ${backup_file}"
    
    # Stop services
    stop_services
    
    # Restore from backup
    "${DEPLOYMENT_DIR}/scripts/backup.sh" restore "${backup_file}"
    
    # Start services
    start_services
    
    log "  ✓ Rollback completed"
}

# Main execution
main() {
    local action="${1:-deploy}"
    
    case "${action}" in
        "deploy")
            check_prerequisites
            create_backup
            build_images
            stop_services
            setup_monitoring
            setup_ssl
            start_services
            verify_deployment
            show_deployment_info
            ;;
        "update")
            check_prerequisites
            create_backup
            update_deployment
            verify_deployment
            show_deployment_info
            ;;
        "rollback")
            rollback_deployment "$2"
            ;;
        "stop")
            stop_services
            ;;
        "start")
            start_services
            ;;
        "restart")
            stop_services
            start_services
            ;;
        "logs")
            show_service_logs
            ;;
        "status")
            cd "${DEPLOYMENT_DIR}"
            ${COMPOSE_CMD} ps
            ;;
        "verify")
            verify_deployment
            ;;
        "help"|"--help"|"-h")
            echo "Usage: $0 {deploy|update|rollback <backup>|stop|start|restart|logs|status|verify|help}"
            echo ""
            echo "Commands:"
            echo "  deploy     - Full deployment (build, configure, start)"
            echo "  update     - Update existing deployment"
            echo "  rollback   - Rollback to backup"
            echo "  stop       - Stop all services"
            echo "  start      - Start all services"
            echo "  restart    - Restart all services"
            echo "  logs       - Show service logs"
            echo "  status     - Show service status"
            echo "  verify     - Verify deployment health"
            echo "  help       - Show this help"
            exit 0
            ;;
        *)
            error "Unknown action: ${action}"
            echo "Usage: $0 {deploy|update|rollback <backup>|stop|start|restart|logs|status|verify|help}"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"