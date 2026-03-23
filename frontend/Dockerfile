# Stage 1: Build
FROM node:20-alpine as build-stage

WORKDIR /app

# On copie les fichiers de configuration en premier (cache Docker)
COPY package*.json ./
RUN npm install

# On copie le code source et on build
COPY . .
# Note: VITE_API_URL pourra être passé au build ou configuré via Nginx proxy
RUN npm run build

# Stage 2: Serve
FROM nginx:stable-alpine as production-stage

# Configuration Nginx pour le SPA (Single Page Application)
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen       80;
    server_name  localhost;

    location / {
        root   /usr/share/nginx/html;
        index  index.html index.htm;
        try_files \$uri \$uri/ /index.html;
    }

    # Proxy vers le backend (optionnel, selon votre infra)
    # location /api {
    #     proxy_pass http://backend-service:80;
    # }

    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }
}
EOF

# On copie les fichiers compilés du stage précédent
COPY --from=build-stage /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
