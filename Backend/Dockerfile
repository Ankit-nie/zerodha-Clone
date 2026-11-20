# TradeX Backend - Production Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install production dependencies first for optimal Docker layer caching
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source
COPY . .

ENV NODE_ENV=production
ENV PORT=3002

EXPOSE 3002

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3002/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

USER node

CMD ["node", "index.js"]
