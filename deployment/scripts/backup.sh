#!/bin/bash

# Ascent XR Dashboard Backup and Recovery Script
# Automated backup of application data, databases, and configurations

set -e

# Configuration
BACKUP_ROOT="/backup"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="${BACKUP_ROOT}/ascent-xr_${DATE}"
RETENTION_DAYS=7
COMPRESSION_LEVEL=6

# Services to backup
SERVICES=(
    "dashboard"
    "prometheus"
    "grafana"
)

# Directories to backup
DIRECTORIES=(
    "/app/data"
    "/app/logs"
    "/app/uploads"
    "/app/documents"
    "/app/exports"
    "/var/lib/grafana"
    "/prometheus"
    "/etc/nginx"
)

# Database configuration (if using external DB)
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="ascent_xr"
DB_USER="postgres"
DB_PASS=""

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

# Create backup directory
create_backup_dir() {
    log "Creating backup directory: ${BACKUP_DIR}"
    mkdir -p "${BACKUP_DIR}"
    mkdir -p "${BACKUP_DIR}/data"
    mkdir -p "${BACKUP_DIR}/configs"
    mkdir -p "${BACKUP_DIR}/databases"
    mkdir -p "${BACKUP_DIR}/logs"
}

# Backup application data
backup_data() {
    log "Backing up application data..."
    
    for dir in "${DIRECTORIES[@]}"; do
        if [ -d "${dir}" ]; then
            local dir_name=$(basename "${dir}")
            local target="${BACKUP_DIR}/data/${dir_name}.tar.gz"
            
            log "  Backing up ${dir}..."
            tar -czf "${target}" -C "$(dirname "${dir}")" "${dir_name}" 2>/dev/null || \
                warn "  Failed to backup ${dir}"
            
            # Verify backup
            if [ -f "${target}" ]; then
                local size=$(du -h "${target}" | cut -f1)
                log "    ✓ ${dir_name}.tar.gz (${size})"
            fi
        else
            warn "  Directory ${dir} does not exist, skipping"
        fi
    done
}

# Backup configurations
backup_configs() {
    log "Backing up configurations..."
    
    # Docker configurations
    if [ -f "/home/jim/openclaw/deployment/docker-compose.yml" ]; then
        cp "/home/jim/openclaw/deployment/docker-compose.yml" "${BACKUP_DIR}/configs/"
        cp "/home/jim/openclaw/deployment/Dockerfile" "${BACKUP_DIR}/configs/"
        cp "/home/jim/openclaw/deployment/.env" "${BACKUP_DIR}/configs/" 2>/dev/null || true
        cp "/home/jim/openclaw/deployment/.env.example" "${BACKUP_DIR}/configs/"
    fi
    
    # Nginx configurations
    if [ -d "/home/jim/openclaw/deployment/nginx" ]; then
        tar -czf "${BACKUP_DIR}/configs/nginx.tar.gz" -C "/home/jim/openclaw/deployment" "nginx"
    fi
    
    # Monitoring configurations
    if [ -d "/home/jim/openclaw/deployment/monitoring" ]; then
        tar -czf "${BACKUP_DIR}/configs/monitoring.tar.gz" -C "/home/jim/openclaw/deployment" "monitoring"
    fi
    
    # Scripts
    if [ -d "/home/jim/openclaw/deployment/scripts" ]; then
        tar -czf "${BACKUP_DIR}/configs/scripts.tar.gz" -C "/home/jim/openclaw/deployment" "scripts"
    fi
    
    log "  Configuration backup completed"
}

# Backup databases
backup_databases() {
    log "Backing up databases..."
    
    # PostgreSQL backup
    if command -v pg_dump &> /dev/null; then
        if [ -n "${DB_PASS}" ]; then
            export PGPASSWORD="${DB_PASS}"
        fi
        
        if pg_dump -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" "${DB_NAME}" > "${BACKUP_DIR}/databases/postgres_${DB_NAME}.sql" 2>/dev/null; then
            log "  ✓ PostgreSQL backup created"
            
            # Compress SQL dump
            gzip "${BACKUP_DIR}/databases/postgres_${DB_NAME}.sql"
        else
            warn "  Failed to backup PostgreSQL database"
        fi
    else
        warn "  pg_dump not found, skipping PostgreSQL backup"
    fi
    
    # MongoDB backup (if used)
    if command -v mongodump &> /dev/null; then
        mongodump --out "${BACKUP_DIR}/databases/mongodb" 2>/dev/null && \
            tar -czf "${BACKUP_DIR}/databases/mongodb.tar.gz" -C "${BACKUP_DIR}/databases" "mongodb" && \
            rm -rf "${BACKUP_DIR}/databases/mongodb"
        log "  ✓ MongoDB backup created"
    fi
}

# Backup Docker volumes
backup_volumes() {
    log "Backing up Docker volumes..."
    
    # List Docker volumes
    local volumes=$(docker volume ls -q --filter name=ascent-*)
    
    for volume in ${volumes}; do
        log "  Backing up volume: ${volume}"
        
        # Create temporary container to backup volume
        docker run --rm \
            -v "${volume}:/data" \
            -v "${BACKUP_DIR}/volumes:/backup" \
            alpine \
            tar -czf "/backup/${volume}.tar.gz" -C /data . 2>/dev/null || \
            warn "    Failed to backup volume ${volume}"
    done
}

# Backup service logs
backup_logs() {
    log "Backing up service logs..."
    
    # System logs
    if [ -d "/var/log" ]; then
        tar -czf "${BACKUP_DIR}/logs/system_logs.tar.gz" \
            --exclude="*.gz" \
            --exclude="*.old" \
            -C /var/log . 2>/dev/null || true
    fi
    
    # Docker logs
    for service in "${SERVICES[@]}"; do
        if docker logs "${service}" --tail 1000 > "${BACKUP_DIR}/logs/${service}_docker.log" 2>/dev/null; then
            log "  ✓ ${service} logs captured"
        fi
    done
    
    # Application logs
    if [ -d "/app/logs" ]; then
        tar -czf "${BACKUP_DIR}/logs/application_logs.tar.gz" -C /app/logs . 2>/dev/null || true
    fi
}

# Create backup manifest
create_manifest() {
    log "Creating backup manifest..."
    
    cat > "${BACKUP_DIR}/manifest.json" << EOF
{
  "backup": {
    "timestamp": "$(date -Iseconds)",
    "version": "1.0.0",
    "system": "$(uname -a)",
    "docker_version": "$(docker --version 2>/dev/null || echo 'not_available')"
  },
  "services": [
    $(printf '"%s",' "${SERVICES[@]}" | sed 's/,$//')
  ],
  "contents": {
    "data": [
      $(for dir in "${DIRECTORIES[@]}"; do echo "\"${dir}\","; done | sed 's/,$//')
    ],
    "databases": [
      "postgresql",
      "mongodb"
    ]
  },
  "metadata": {
    "total_size": "$(du -sh "${BACKUP_DIR}" | cut -f1)",
    "file_count": "$(find "${BACKUP_DIR}" -type f | wc -l)",
    "compression": "gzip",
    "retention_days": ${RETENTION_DAYS}
  }
}
EOF
    
    log "  Manifest created: ${BACKUP_DIR}/manifest.json"
}

# Compress final backup
compress_backup() {
    log "Compressing final backup..."
    
    local final_archive="${BACKUP_ROOT}/ascent-xr_${DATE}.tar.gz"
    
    tar -czf "${final_archive}" \
        --exclude="*.tar.gz" \
        -C "${BACKUP_ROOT}" \
        "ascent-xr_${DATE}"
    
    if [ $? -eq 0 ]; then
        local size=$(du -h "${final_archive}" | cut -f1)
        log "  ✓ Final archive: ${final_archive} (${size})"
        
        # Remove uncompressed directory
        rm -rf "${BACKUP_DIR}"
    else
        error "Failed to compress backup"
        exit 1
    fi
}

# Clean up old backups
cleanup_old_backups() {
    log "Cleaning up backups older than ${RETENTION_DAYS} days..."
    
    find "${BACKUP_ROOT}" -name "ascent-xr_*.tar.gz" -mtime +${RETENTION_DAYS} -delete
    
    local remaining=$(find "${BACKUP_ROOT}" -name "ascent-xr_*.tar.gz" | wc -l)
    log "  ${remaining} backups remaining in ${BACKUP_ROOT}"
}

# Verify backup integrity
verify_backup() {
    log "Verifying backup integrity..."
    
    local archive="${BACKUP_ROOT}/ascent-xr_${DATE}.tar.gz"
    
    if [ ! -f "${archive}" ]; then
        error "Backup archive not found: ${archive}"
        return 1
    fi
    
    # Check if archive is valid
    if tar -tzf "${archive}" > /dev/null 2>&1; then
        log "  ✓ Backup archive is valid"
        
        # Check for critical files
        local manifest=$(tar -tzf "${archive}" | grep manifest.json)
        if [ -n "${manifest}" ]; then
            log "  ✓ Manifest found in archive"
        else
            warn "  Manifest not found in archive"
        fi
        
        return 0
    else
        error "  Backup archive is corrupted"
        return 1
    fi
}

# Send notification (optional)
send_notification() {
    local status=$1
    local archive="${BACKUP_ROOT}/ascent-xr_${DATE}.tar.gz"
    local size=$(du -h "${archive}" | cut -f1 2>/dev/null || echo "unknown")
    
    # Example: Send email notification
    # echo "Backup ${status}: ${archive} (${size})" | mail -s "Ascent XR Backup ${status}" admin@ascent-xr.local
    
    # Example: Send Slack notification
    # curl -X POST -H 'Content-type: application/json' \
    #   --data "{\"text\":\"Backup ${status}: ${archive} (${size})\"}" \
    #   https://hooks.slack.com/services/XXX/XXX/XXX
    
    log "Backup ${status}: ${archive} (${size})"
}

# Restore from backup (separate function, called with --restore)
restore_backup() {
    local archive="$1"
    
    if [ ! -f "${archive}" ]; then
        error "Backup archive not found: ${archive}"
        exit 1
    fi
    
    log "Restoring from backup: ${archive}"
    
    # Extract backup
    local restore_dir="${BACKUP_ROOT}/restore_${DATE}"
    mkdir -p "${restore_dir}"
    tar -xzf "${archive}" -C "${restore_dir}"
    
    # TODO: Implement restore logic based on manifest.json
    # This would involve:
    # 1. Stopping services
    # 2. Restoring data directories
    # 3. Restoring databases
    # 4. Restoring configurations
    # 5. Starting services
    
    warn "Restore functionality not fully implemented yet"
    info "Backup extracted to: ${restore_dir}"
    info "Review manifest.json for restore instructions: ${restore_dir}/ascent-xr_*/manifest.json"
}

# Main execution
main() {
    local action="${1:-backup}"
    
    case "${action}" in
        "backup")
            log "Starting Ascent XR Dashboard backup..."
            create_backup_dir
            backup_data
            backup_configs
            backup_databases
            backup_volumes
            backup_logs
            create_manifest
            compress_backup
            cleanup_old_backups
            verify_backup
            send_notification "completed"
            log "Backup completed successfully!"
            ;;
        "restore")
            if [ -z "$2" ]; then
                error "Please specify backup archive to restore"
                echo "Usage: $0 restore /path/to/backup.tar.gz"
                exit 1
            fi
            restore_backup "$2"
            ;;
        "verify")
            verify_backup
            ;;
        "cleanup")
            cleanup_old_backups
            ;;
        *)
            echo "Usage: $0 {backup|restore <archive>|verify|cleanup}"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"