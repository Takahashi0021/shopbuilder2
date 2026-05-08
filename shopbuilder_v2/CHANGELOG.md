# CHANGELOG

## Sprint 1

### Implemented
- Full auth subsystem: register, login, logout, refresh, RBAC middleware
- JWT access (15m) + refresh (7d) tokens with DB-backed revocation
- Redis rate limiting on /auth routes (5 req/min/IP)
- CORS with explicit origin whitelist (no wildcard)
- Tenant onboarding with dynamic connection routing
- Product CRUD with cursor-based pagination
- Variant matrix generator (Size × Color × Material → SKU)
- Stock adjustment with oversell protection
- Webhook schema with retry/backoff columns
- Swagger UI at /docs
- Unit + integration tests
- CI/CD pipeline

### Deviations from Blueprint
- Webhook dispatcher (retry with exponential backoff) deferred to Sprint 2. Schema is complete.
- Multi-DB tenant isolation uses connection routing to separate DB URLs. Schema-per-tenant deferred to Sprint 2 as it requires dynamic migration runs.
