FROM node:20-alpine as builder

WORKDIR /app

ARG VITE_MASTER_DOMAIN=master.localhost
ARG VITE_APP_DOMAIN=app.localhost
ARG VITE_API_URL=http://localhost/api

ENV VITE_MASTER_DOMAIN=$VITE_MASTER_DOMAIN
ENV VITE_APP_DOMAIN=$VITE_APP_DOMAIN
ENV VITE_API_URL=$VITE_API_URL

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY docker/nginx/frontend.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]