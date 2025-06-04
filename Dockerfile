# 🚀 SKKU Fine Art Club Gallery - Docker Configuration
FROM node:22.13.0-alpine

# 📁 Working directory
WORKDIR /app

# 👤 User setup for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S gallery -u 1001

# 📦 Copy package files
COPY package*.json ./

# 🔧 Install dependencies
RUN npm ci --only=production && npm cache clean --force

# 📁 Create directories with proper permissions
RUN mkdir -p /app/logs /app/public/uploads && \
    chown -R gallery:nodejs /app

# 🔄 Switch to non-root user
USER gallery

# 📂 Copy application code
COPY --chown=gallery:nodejs . .

# 🌍 Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# 🔍 Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# 🚀 Expose port
EXPOSE 3000

# 🏃 Start command
CMD ["npm", "start"]
