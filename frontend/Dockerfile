FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Set build-time environment variables
ARG REACT_APP_BACKEND_URL=http://localhost:8081
ARG SERVER_IP=localhost
ARG BACKEND_PORT=8081
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL

RUN npm run build

FROM nginx:alpine

# Install envsubst for environment variable substitution
RUN apk add --no-cache gettext

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf.template

# Set environment variables for nginx config
ARG SERVER_IP=localhost
ARG BACKEND_PORT=8081
ENV SERVER_IP=$SERVER_IP
ENV BACKEND_PORT=$BACKEND_PORT

EXPOSE 80

# Replace placeholders and start nginx
CMD envsubst '${SERVER_IP} ${BACKEND_PORT}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf && nginx -g 'daemon off;'

