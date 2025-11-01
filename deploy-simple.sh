#!/bin/bash

echo "🚀 Simple Docker deployment..."

# Install Docker if not installed
if ! command -v docker &> /dev/null; then
    sudo apt update -y
    sudo apt install -y docker.io
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -a -G docker ubuntu
fi

# Install Docker Compose if not installed
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Copy environment file
cp .env.prod .env

echo "🐳 Building and starting containers..."
sudo docker-compose down
sudo docker-compose up --build -d

echo "✅ Deployment complete!"
echo "🌐 Access your app at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"

# Show status
sudo docker-compose ps
sudo docker-compose logs --tail=20
