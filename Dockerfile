FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY src ./src

FROM node:18-alpine AS production

RUN addgroup -S taskflow && adduser -S taskflow -G taskflow

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder /app/src ./src

RUN chown -R taskflow:taskflow /app
USER taskflow

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:5000/health || exit 1

CMD ["node", "src/server.js"]
