# Docker Deployment Guide

## Quick Environment Switch

### For Local Development:
```bash
# Backend
cp .env.local .env
# Frontend
cp frontend/.env.local frontend/.env
```

### For Production:
```bash
# Backend
cp .env.production .env
# Frontend
cp frontend/.env.production frontend/.env
# Edit both .env files and update SERVER_IP to your production server IP
```

## Configuration Files to Update:

### 1. Environment Variables (.env)
- `SERVER_IP`: localhost (local) or your server IP (production)
- `BACKEND_PORT`: 8081 (default)
- `FRONTEND_PORT`: 3000 (local) or 80 (production)
- `DB_PORT`: 5432 (default)

### 2. Application Properties (backend-java/src/main/resources/application.properties)
- Uses `SERVER_IP` environment variable automatically
- No manual changes needed

## Deployment Commands:

### Local Development:
```bash
cp .env.local .env
cp frontend/.env.local frontend/.env
docker-compose up --build
# Access: http://localhost:3000
```

### Production:
```bash
cp .env.production .env
cp frontend/.env.production frontend/.env
# Edit both .env files and set SERVER_IP=your-production-ip
docker-compose up --build -d
# Access: http://your-production-ip
```

## Port Mapping:
- **Local**: Frontend on 3000, Backend on 8081, DB on 5432
- **Production**: Frontend on 80, Backend on 8081, DB on 5432

## Environment Variables Used:
- `SERVER_IP`: Server IP address
- `BACKEND_PORT`: Backend service port
- `FRONTEND_PORT`: Frontend service port  
- `DB_PORT`: Database port
- All other credentials from .env file