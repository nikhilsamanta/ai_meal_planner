FROM node:20-alpine AS base
WORKDIR /app

# Install production dependencies
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production

# Runner stage
FROM base AS runner
ENV NODE_ENV=production

# Alpine's official Node image provides a built-in unprivileged user 'node' (UID 1000)
USER node

COPY --chown=node:node package*.json ./
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node . .

EXPOSE 5000

CMD ["node", "src/server.js"]