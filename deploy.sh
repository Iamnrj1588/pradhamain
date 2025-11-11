#!/bin/bash

echo "🚀 Building Pradha Fashion Outlet for Production..."

# Build backend JAR
echo "📦 Building backend..."
cd backend-java
mvn clean package -DskipTests
cd ..

# Build and start containers
echo "🐳 Building Docker containers..."
docker-compose down
docker-compose build --no-cache
docker-compose up -d

echo "✅ Deployment complete!"
echo "🌐 Frontend: http://localhost"
echo "🔧 Backend API: http://localhost:8081"
echo "📊 Database: PostgreSQL on localhost:5432"

# Show container status
docker-compose ps