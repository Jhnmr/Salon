# SALON - Deployment Guide

This guide covers deploying the SALON application to production environments using Docker, cloud platforms, and various hosting options.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Docker Deployment](#docker-deployment)
- [Cloud Platform Deployment](#cloud-platform-deployment)
- [SSL/HTTPS Setup](#sslhttps-setup)
- [Database Migrations](#database-migrations)
- [Backup Strategy](#backup-strategy)
- [Monitoring & Logging](#monitoring--logging)
- [Performance Optimization](#performance-optimization)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

- **Server**: Ubuntu 20.04+ or similar Linux distribution
- **Memory**: Minimum 2GB RAM (4GB+ recommended)
- **Storage**: Minimum 20GB SSD
- **CPU**: 2+ cores recommended

### Required Software

- Docker Engine 20.10+
- Docker Compose 2.0+
- Git
- Nginx (for reverse proxy)
- Certbot (for SSL certificates)

### Domain Setup

- Domain name pointing to your server IP
- DNS A records configured:
  - `salon.app` → Server IP
  - `www.salon.app` → Server IP
  - `api.salon.app` → Server IP

## Environment Setup

### 1. Server Preparation

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installations
docker --version
docker-compose --version
```

### 2. Clone Repository

```bash
# Create application directory
sudo mkdir -p /var/www/salon
sudo chown $USER:$USER /var/www/salon

# Clone repository
cd /var/www
git clone https://github.com/yourusername/salon.git
cd salon
```

### 3. Configure Environment Variables

#### Backend (.env)

```bash
cd backend
cp .env.example .env
nano .env
```

Update the following variables:

```env
APP_NAME=SALON
APP_ENV=production
APP_KEY=                    # Generate with: php artisan key:generate
APP_DEBUG=false
APP_URL=https://salon.app

# Database
DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=salon
DB_USERNAME=salon
DB_PASSWORD=your_secure_password_here

# Redis
REDIS_HOST=redis
REDIS_PASSWORD=your_secure_redis_password_here
REDIS_PORT=6379

# Cache & Sessions
CACHE_DRIVER=redis
SESSION_DRIVER=redis
SESSION_LIFETIME=120

# Queue
QUEUE_CONNECTION=redis

# Mail (configure your mail provider)
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_username
MAIL_PASSWORD=your_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@salon.app
MAIL_FROM_NAME="${APP_NAME}"

# AWS S3 (if using S3 for file storage)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

# Sanctum
SANCTUM_STATEFUL_DOMAINS=salon.app,www.salon.app
SESSION_DOMAIN=.salon.app
```

#### Frontend (.env)

```bash
cd ../frontend
nano .env
```

```env
VITE_API_URL=https://api.salon.app
```

#### Docker Compose (.env)

Create a `.env` file in the root directory:

```bash
cd /var/www/salon
nano .env
```

```env
# Application
APP_ENV=production
APP_KEY=base64:your_generated_key_here
APP_DEBUG=false
APP_URL=https://salon.app

# Database
DB_DATABASE=salon
DB_USERNAME=salon
DB_PASSWORD=your_secure_password_here
DB_PORT=5432

# Redis
REDIS_PASSWORD=your_secure_redis_password_here
REDIS_PORT=6379

# Ports
NGINX_PORT=8000
FRONTEND_PORT=3000

# Frontend
VITE_API_URL=https://api.salon.app
NODE_ENV=production
FRONTEND_TARGET=production
```

### 4. Generate Application Key

```bash
docker-compose run --rm app php artisan key:generate
```

## Docker Deployment

### 1. Create Production Docker Compose Override

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  app:
    restart: always
    environment:
      - APP_ENV=production
      - APP_DEBUG=false

  nginx:
    restart: always

  postgres:
    restart: always
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - /var/backups/salon/postgres:/backups

  redis:
    restart: always
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}

  frontend:
    restart: always
    build:
      target: production

  queue:
    restart: always

  scheduler:
    restart: always
```

### 2. Build and Start Services

```bash
# Build images
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache

# Start services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Check service status
docker-compose ps
```

### 3. Run Migrations and Seeders

```bash
# Run migrations
docker-compose exec app php artisan migrate --force

# (Optional) Seed initial data
docker-compose exec app php artisan db:seed --class=ProductionSeeder

# Optimize Laravel
docker-compose exec app php artisan config:cache
docker-compose exec app php artisan route:cache
docker-compose exec app php artisan view:cache
docker-compose exec app php artisan optimize
```

### 4. Create Storage Link

```bash
docker-compose exec app php artisan storage:link
```

## Cloud Platform Deployment

### AWS (EC2 + RDS + S3)

#### 1. Launch EC2 Instance

```bash
# AMI: Ubuntu Server 20.04 LTS
# Instance Type: t3.medium (2 vCPU, 4GB RAM)
# Storage: 30GB gp3 SSD
# Security Group: Allow ports 80, 443, 22
```

#### 2. Setup RDS PostgreSQL

```bash
# Database Engine: PostgreSQL 15
# Instance Class: db.t3.micro
# Multi-AZ: Enabled (for production)
# Backup: Enable automated backups
```

Update backend/.env:
```env
DB_HOST=your-rds-endpoint.rds.amazonaws.com
DB_PORT=5432
DB_DATABASE=salon
DB_USERNAME=salon
DB_PASSWORD=your_password
```

#### 3. Setup S3 for File Storage

```bash
# Create S3 bucket
aws s3 mb s3://salon-files

# Configure CORS
aws s3api put-bucket-cors --bucket salon-files --cors-configuration file://cors.json
```

Update backend/.env:
```env
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=salon-files
```

### DigitalOcean (Droplet + Managed Database)

```bash
# Create Droplet: Ubuntu 20.04, 2GB RAM, 2 vCPU
# Create Managed PostgreSQL Database
# Create Managed Redis

# Configure firewall
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable
```

### Google Cloud Platform (GCE + Cloud SQL)

```bash
# Create Compute Engine instance
# Create Cloud SQL PostgreSQL instance
# Create Cloud Storage bucket
# Configure VPC and firewall rules
```

## SSL/HTTPS Setup

### Using Certbot (Let's Encrypt)

#### 1. Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

#### 2. Obtain SSL Certificate

```bash
sudo certbot --nginx -d salon.app -d www.salon.app -d api.salon.app
```

#### 3. Setup Reverse Proxy

Create `/etc/nginx/sites-available/salon.app`:

```nginx
# Frontend
server {
    listen 80;
    server_name salon.app www.salon.app;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name salon.app www.salon.app;

    ssl_certificate /etc/letsencrypt/live/salon.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/salon.app/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API
server {
    listen 80;
    server_name api.salon.app;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.salon.app;

    ssl_certificate /etc/letsencrypt/live/salon.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/salon.app/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/salon.app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 4. Auto-renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Certbot automatically creates a cron job for renewal
```

## Database Migrations

### Running Migrations

```bash
# Backup database first
docker-compose exec postgres pg_dump -U salon salon > backup-$(date +%Y%m%d).sql

# Run migrations
docker-compose exec app php artisan migrate --force

# Rollback if needed
docker-compose exec app php artisan migrate:rollback --step=1
```

### Zero-Downtime Migrations

```bash
# 1. Enable maintenance mode
docker-compose exec app php artisan down --retry=60 --secret="your-secret-token"

# 2. Pull latest code
git pull origin main

# 3. Rebuild containers
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

# 4. Update containers
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 5. Run migrations
docker-compose exec app php artisan migrate --force

# 6. Clear cache
docker-compose exec app php artisan optimize:clear
docker-compose exec app php artisan optimize

# 7. Disable maintenance mode
docker-compose exec app php artisan up
```

## Backup Strategy

### Automated Database Backups

Create `/usr/local/bin/salon-backup.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/var/backups/salon"
DATE=$(date +%Y%m%d-%H%M%S)
POSTGRES_CONTAINER="salon_postgres"
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup PostgreSQL
docker exec $POSTGRES_CONTAINER pg_dump -U salon salon | gzip > $BACKUP_DIR/postgres-$DATE.sql.gz

# Backup application files
tar -czf $BACKUP_DIR/files-$DATE.tar.gz /var/www/salon/backend/storage

# Delete old backups
find $BACKUP_DIR -name "postgres-*.sql.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "files-*.tar.gz" -mtime +$RETENTION_DAYS -delete

# Upload to S3 (optional)
# aws s3 cp $BACKUP_DIR/postgres-$DATE.sql.gz s3://salon-backups/
```

Make it executable and add to crontab:

```bash
chmod +x /usr/local/bin/salon-backup.sh

# Add to crontab (daily at 2 AM)
crontab -e
0 2 * * * /usr/local/bin/salon-backup.sh
```

### Restore from Backup

```bash
# Restore PostgreSQL
gunzip < /var/backups/salon/postgres-20240101.sql.gz | docker exec -i salon_postgres psql -U salon salon

# Restore files
tar -xzf /var/backups/salon/files-20240101.tar.gz -C /
```

## Monitoring & Logging

### Setup Log Rotation

Create `/etc/logrotate.d/salon`:

```
/var/www/salon/backend/storage/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0644 www-data www-data
    sharedscripts
    postrotate
        docker-compose -f /var/www/salon/docker-compose.yml restart app > /dev/null
    endscript
}
```

### Health Checks

Create `/usr/local/bin/salon-health-check.sh`:

```bash
#!/bin/bash

# Check backend API
if ! curl -f http://localhost:8000/api/health > /dev/null 2>&1; then
    echo "Backend health check failed"
    # Send alert (email, Slack, etc.)
fi

# Check frontend
if ! curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "Frontend health check failed"
fi

# Check database
if ! docker exec salon_postgres pg_isready -U salon > /dev/null 2>&1; then
    echo "Database health check failed"
fi
```

Add to crontab (every 5 minutes):

```bash
*/5 * * * * /usr/local/bin/salon-health-check.sh
```

## Performance Optimization

### Laravel Optimization

```bash
# Cache configuration
docker-compose exec app php artisan config:cache

# Cache routes
docker-compose exec app php artisan route:cache

# Cache views
docker-compose exec app php artisan view:cache

# Optimize autoloader
docker-compose exec app composer install --optimize-autoloader --no-dev
```

### Database Optimization

```bash
# Create indexes (add to migrations)
php artisan make:migration add_indexes_to_reservations_table

# PostgreSQL vacuum
docker exec salon_postgres vacuumdb -U salon -d salon -z -v
```

### Redis Optimization

```bash
# Monitor Redis
docker exec -it salon_redis redis-cli
> INFO
> DBSIZE
> MONITOR
```

## Troubleshooting

### Common Issues

#### 1. Permission Errors

```bash
docker-compose exec app chown -R www-data:www-data /var/www/html/storage
docker-compose exec app chmod -R 775 /var/www/html/storage
```

#### 2. Database Connection Errors

```bash
# Check database logs
docker-compose logs postgres

# Test connection
docker-compose exec app php artisan tinker
>>> DB::connection()->getPdo();
```

#### 3. Application Not Starting

```bash
# Check logs
docker-compose logs -f app

# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

#### 4. High Memory Usage

```bash
# Check container stats
docker stats

# Restart services
docker-compose restart
```

### Debug Mode

```bash
# Enable debug mode (NEVER in production)
docker-compose exec app php artisan config:clear
# Edit .env: APP_DEBUG=true
docker-compose exec app php artisan config:cache

# View logs in real-time
docker-compose logs -f app
tail -f backend/storage/logs/laravel.log
```

## Security Checklist

- [ ] SSL certificates installed and auto-renewing
- [ ] Firewall configured (only ports 80, 443, 22 open)
- [ ] Strong database passwords
- [ ] Redis password enabled
- [ ] APP_DEBUG=false in production
- [ ] Regular security updates applied
- [ ] Backups configured and tested
- [ ] Environment variables secured
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] SQL injection protection (using Eloquent ORM)
- [ ] XSS protection enabled
- [ ] CSRF protection enabled

## Updating the Application

```bash
# 1. Backup first
/usr/local/bin/salon-backup.sh

# 2. Pull latest changes
cd /var/www/salon
git pull origin main

# 3. Update backend dependencies
docker-compose exec app composer install --no-dev --optimize-autoloader

# 4. Update frontend dependencies
docker-compose exec frontend npm ci

# 5. Run migrations
docker-compose exec app php artisan migrate --force

# 6. Clear and rebuild cache
docker-compose exec app php artisan optimize:clear
docker-compose exec app php artisan optimize

# 7. Rebuild containers if Dockerfile changed
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 8. Restart queue workers
docker-compose restart queue
```

## Support

For deployment issues:
- Email: devops@salon.app
- Documentation: https://docs.salon.app/deployment
- GitHub Issues: https://github.com/yourusername/salon/issues
