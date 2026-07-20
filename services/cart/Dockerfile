# --- deps stage: install production dependencies ---
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# --- runtime stage: minimal image with only what's needed to run ---
FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

RUN addgroup -S -g 10001 app && adduser -S -u 10001 -G app app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src

USER 10001
EXPOSE 3000
CMD ["node", "src/index.js"]
