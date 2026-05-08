# ShopBuilder API v2

Multi-tenant e-commerce platform backend.

## Quick Start

```bash
git clone <your-repo>
cd shopbuilder
cp .env.example .env
# Edit .env with your secrets and Gmail credentials
docker compose up --build
```

## Manual Setup

```bash
npm install
cp .env.example .env
npx prisma migrate deploy
npm start
# In separate terminal:
npm run worker
```

## Gmail Setup

1. Go to Google Account → Security → 2-Step Verification → App Passwords
2. Generate password for "Mail"
3. Add to .env: GMAIL_USER and GMAIL_APP_PASSWORD

## API

- Swagger UI: http://localhost:3000/docs
- Health: http://localhost:3000/api/v1/health

## Roles

| Role | Access |
|---|---|
| ADMIN | Full system access |
| MERCHANT | Own store, products, orders |
| CUSTOMER | Browse stores, create orders |

## Test

```bash
npm test
npm run test:unit
```
