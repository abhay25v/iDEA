# Deployment Guide

## Production Deployment

### Prerequisites

- Linux server (Ubuntu 20.04 LTS or similar)
- Docker & Docker Compose
- SSL certificate
- Domain name
- Sufficient storage (100GB+ recommended)

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installations
docker --version
docker-compose --version
```

### Step 2: Clone & Setup

```bash
# Clone repository
git clone <repo-url> /opt/fintrace
cd /opt/fintrace

# Copy environment file
cp .env.example .env

# Edit with production values
sudo nano .env
```

### Step 3: SSL Configuration

```bash
# Using Let's Encrypt with Certbot
sudo apt install certbot python3-certbot-nginx -y

# Generate certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Update nginx.conf with paths to certificates
sudo nano docker/nginx.conf
```

### Step 4: Database Backup Strategy

```bash
# Create backup directory
sudo mkdir -p /backups/fintrace

# MongoDB backup script
cat > /opt/fintrace/scripts/backup-mongo.sh << 'EOF'
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
docker exec fintrace-mongodb mongodump --username admin --password admin123 \
  --authenticationDatabase admin \
  --out /data/backups/mongo_${TIMESTAMP}
EOF

# Neo4j backup script  
cat > /opt/fintrace/scripts/backup-neo4j.sh << 'EOF'
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
docker exec fintrace-neo4j neo4j-admin database dump neo4j \
  /data/backups/neo4j_${TIMESTAMP}.dump
EOF

# Schedule daily backups (cron)
0 2 * * * /opt/fintrace/scripts/backup-mongo.sh
0 3 * * * /opt/fintrace/scripts/backup-neo4j.sh
```

### Step 5: Deploy Services

```bash
# Build production images
docker-compose build --no-cache

# Start services
docker-compose up -d

# Verify all services are running
docker-compose ps

# Check logs
docker-compose logs -f
```

### Step 6: Monitoring & Logging

```bash
# Setup log rotation
cat > /etc/logrotate.d/fintrace << 'EOF'
/opt/fintrace/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 root root
    sharedscripts
}
EOF

# Setup monitoring alerts
# Consider: Prometheus, Grafana, ELK stack
```

### Step 7: Nginx Configuration

```nginx
upstream backend {
    server backend:5000;
}

upstream ml_service {
    server ml-service:8000;
}

server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend
    location / {
        proxy_pass http://frontend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
    }

    # API
    location /api/ {
        proxy_pass http://backend/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # ML Service
    location /ml/ {
        proxy_pass http://ml_service/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## Scaling

### Horizontal Scaling

```yaml
# docker-compose.override.yml for multiple instances

version: '3.9'
services:
  backend:
    deploy:
      replicas: 3
    
  ml-service:
    deploy:
      replicas: 2
```

### Load Balancing

Use Nginx/HAProxy to distribute traffic across multiple service instances.

### Database Scaling

- **MongoDB**: Enable replication and sharding
- **Neo4j**: Enterprise edition with clustering
- **Redis**: Sentinel for high availability

## Security Hardening

### Network Security
```bash
# Configure firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Application Security

```bash
# Ensure proper permissions
sudo chown -R $USER:$USER /opt/fintrace

# Set secure env variables
chmod 600 .env

# Regular security updates
sudo apt update && sudo apt upgrade -y
```

### Database Security

```bash
# Strong passwords (generate with openssl)
openssl rand -base64 32

# Enable MongoDB authentication
# Enable Neo4j SSL
```

## Monitoring & Alerts

### Health Checks

```bash
# Configure health endpoints
/api/health → Backend status
/health → ML Service status
```

### Prometheus Metrics

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'fintrace-backend'
    static_configs:
      - targets: ['localhost:5000']

  - job_name: 'fintrace-ml'
    static_configs:
      - targets: ['localhost:8000']
```

### Alert Rules

```yaml
groups:
  - name: fintrace-alerts
    rules:
      - alert: HighErrorRate
        expr: rate(errors_total[5m]) > 0.05
        for: 5m
        
      - alert: DatabaseDown
        expr: up{job="mongodb"} == 0
        for: 1m
```

## Database Migration

### MongoDB to Cloud

```bash
# Using MongoDB Atlas
mongorestore --uri "mongodb+srv://user:pass@cluster.mongodb.net/fintrace" \
  --dir /backups/mongo_backup
```

### Neo4j to Cloud

```bash
# Using Neo4j AuraDB
neo4j-admin database load neo4j --from-path=/backups/neo4j.dump
```

## Performance Tuning

### Backend
```javascript
// Connection pooling
const pool = {
  maxConnections: 100,
  minConnections: 10,
  idleTimeout: 900000
};
```

### Frontend
```javascript
// Build optimization
npm run build -- --analyze
```

### ML Service
```python
# Model caching
@lru_cache(maxsize=1000)
def predict(features):
    return model.predict(features)
```

## Disaster Recovery

### Backup Strategy

1. **Daily**: Full database backups
2. **Hourly**: Transaction logs
3. **Off-site**: Cloud storage backup

### Restore Procedure

```bash
# Restore from backup
docker-compose down
docker volume prune
docker-compose up -d
./scripts/restore-mongo.sh
./scripts/restore-neo4j.sh
docker-compose restart backend
```

### RTO/RPO Goals

- **RTO** (Recovery Time Objective): < 1 hour
- **RPO** (Recovery Point Objective): < 15 minutes

## Cost Optimization

### Cloud Deployment (AWS/GCP/Azure)

- Use autoscaling for variable load
- Consider spot instances for non-critical services
- Enable S3/Cloud Storage lifecycle policies
- Monitor and optimize data transfer costs

### Resource Limits

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

## Maintenance

### Regular Tasks

- [ ] Daily: Monitor logs and alerts
- [ ] Weekly: Review performance metrics
- [ ] Monthly: Security patches and updates
- [ ] Quarterly: Database optimization
- [ ] Annually: Disaster recovery drill

### Version Upgrades

```bash
# Update all dependencies
docker-compose pull
docker-compose up -d

# Check compatibility before upgrading
# Test in staging first
```

## Support & Troubleshooting

### Debug Mode

```bash
DEBUG=* docker-compose up
```

### Common Issues

1. **Out of Memory**: Increase container limits
2. **Slow Queries**: Add database indexes
3. **High CPU**: Profile and optimize code
4. **Disk Full**: Enable log rotation, remove old backups

## Compliance

- [ ] GDPR data processing agreement
- [ ] PCI DSS for payment data
- [ ] SOC 2 audit requirements
- [ ] Data retention policies
- [ ] Audit logging
