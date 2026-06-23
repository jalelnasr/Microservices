# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Build-time arguments - these get baked into the React bundle
ARG REACT_APP_API_BASE_URL=http://localhost:8080
ARG REACT_APP_KEYCLOAK_URL=http://localhost:8180
ARG REACT_APP_KEYCLOAK_REALM=microservices-realm
ARG REACT_APP_KEYCLOAK_CLIENT_ID=frontend-client

# Set environment variables for build - React reads these during build
ENV REACT_APP_API_BASE_URL=${REACT_APP_API_BASE_URL}
ENV REACT_APP_KEYCLOAK_URL=${REACT_APP_KEYCLOAK_URL}
ENV REACT_APP_KEYCLOAK_REALM=${REACT_APP_KEYCLOAK_REALM}
ENV REACT_APP_KEYCLOAK_CLIENT_ID=${REACT_APP_KEYCLOAK_CLIENT_ID}
ENV GENERATE_SOURCEMAP=false

# Debug: Print env vars to verify they're set
RUN echo "API_BASE_URL=$REACT_APP_API_BASE_URL" && \
    echo "KEYCLOAK_URL=$REACT_APP_KEYCLOAK_URL"

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies needed for build)
RUN npm install

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built app from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx configuration and remove default config
COPY nginx.conf /etc/nginx/nginx.conf
RUN rm -f /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]