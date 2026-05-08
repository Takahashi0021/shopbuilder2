FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS dev-deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine
WORKDIR /app
COPY --from=dev-deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
EXPOSE 3000
CMD ["node", "src/index.js"]
