FROM node:20-slim AS base

WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS dev-deps
RUN npm install prisma --save-dev

FROM base AS app-stage
COPY --from=dev-deps /app/node_modules ./node_modules
COPY . .

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

RUN npx prisma generate

EXPOSE 3000
CMD ["npm", "start"]