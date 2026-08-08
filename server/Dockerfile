# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build

# ---- Production Stage ----
FROM node:20-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps --omit=dev

COPY --from=builder /app/dist ./dist

# Create data directory for SQLite (if used)
RUN mkdir -p /app/data

EXPOSE 3000

CMD ["node", "dist/main.js"]
