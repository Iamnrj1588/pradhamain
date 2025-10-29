# EC2 Deployment Guide

## Prerequisites
- EC2 instance (t3.medium or larger recommended)
- Security Group with ports 80, 443, 22 open
- Elastic IP (optional but recommended)

## Deployment Steps

### 1. Launch EC2 Instance
- AMI: Amazon Linux 2
- Instance Type: t3.medium (2 vCPU, 4GB RAM)
- Storage: 20GB GP3
- Security Group: Allow HTTP (80), HTTPS (443), SSH (22)

### 2. Upload Application Files
```bash
# From your local machine
scp -r -i your-key.pem . ec2-user@your-ec2-ip:/opt/pradha-app/
```

### 3. Connect and Deploy
```bash
# SSH to EC2
ssh -i your-key.pem ec2-user@your-ec2-ip

# Run deployment script
cd /opt/pradha-app
chmod +x deploy-ec2.sh
./deploy-ec2.sh
```

### 4. Configure Environment
```bash
# Update production environment
cp .env.prod .env
nano .env  # Update any specific values
```

### 5. Start Application
```bash
sudo docker-compose up -d
```

## Post-Deployment

### Check Status
```bash
sudo docker-compose ps
sudo docker-compose logs -f
```

### Access Application
- Frontend: http://your-ec2-ip
- Backend API: http://your-ec2-ip:8081
- Admin Panel: http://your-ec2-ip/admin

### SSL Setup (Optional)
```bash
# Install Certbot for Let's Encrypt
sudo yum install -y certbot
sudo certbot --nginx -d your-domain.com
```

## Monitoring
```bash
# View logs
sudo docker-compose logs -f backend
sudo docker-compose logs -f frontend

# Check resource usage
docker stats
```

## Backup
```bash
# Backup database
sudo docker-compose exec db pg_dump -U pradha pradhadb > backup.sql

# Backup uploaded files
tar -czf data-backup.tar.gz data/
```