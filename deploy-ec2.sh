#!/bin/bash

echo "🚀 Deploying Pradha Fashion Outlet on EC2..."

# Update system
sudo yum update -y

# Install Docker
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create application directory
sudo mkdir -p /opt/pradha-app
sudo chown ec2-user:ec2-user /opt/pradha-app
cd /opt/pradha-app

# Copy application files (assuming they're uploaded)
echo "📁 Application files should be in /opt/pradha-app"

# Build backend JAR
echo "📦 Building backend..."
cd backend-java
sudo docker run --rm -v "$PWD":/app -w /app maven:3.8.4-openjdk-17 mvn clean package -DskipTests
cd ..

# Set up environment
cp .env.example .env
echo "⚠️  Please update .env file with your production values"

# Build and start containers
echo "🐳 Starting containers..."
sudo docker-compose down
sudo docker-compose build --no-cache
sudo docker-compose up -d

# Configure firewall (if needed)
echo "🔥 Configuring security groups..."
echo "Make sure EC2 security group allows:"
echo "- Port 80 (HTTP) from 0.0.0.0/0"
echo "- Port 443 (HTTPS) from 0.0.0.0/0"
echo "- Port 22 (SSH) from your IP"

echo "✅ Deployment complete!"
echo "🌐 Access your app at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"

# Show status
sudo docker-compose ps