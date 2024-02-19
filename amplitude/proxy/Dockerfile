FROM nginx:1.25.4-alpine

RUN apk upgrade --update-cache --available

COPY nginx.conf /etc/nginx/nginx.conf

STOPSIGNAL SIGTERM

CMD ["nginx", "-g", "daemon off;"]
