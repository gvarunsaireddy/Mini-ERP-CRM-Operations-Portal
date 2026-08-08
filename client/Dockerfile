# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Set API URL for production build
ARG VITE_API_URL=http://localhost:3000/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ---- Production Stage ----
FROM nginx:alpine AS production

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
