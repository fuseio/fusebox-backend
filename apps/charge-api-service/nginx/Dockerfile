FROM nginx:1.21.3-alpine

# Upgrade APK packages
RUN apk upgrade --update-cache --available

# Install `curl` for ECS health check
RUN apk --no-cache add curl

# Copy nginx.conf config
COPY nginx.conf /etc/nginx/nginx.conf

STOPSIGNAL SIGTERM

CMD ["nginx", "-g", "daemon off;"]
