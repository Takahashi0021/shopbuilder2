require("./config/env");
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");
const env = require("./config/env");
const routes = require("./routes");
const { errorHandler, notFound } = require("./middlewares/errorHandler");
const { apiLimiter } = require("./middlewares/rateLimiter");
const logger = require("./utils/logger");

const app = express();

if (env.NODE_ENV === 'development') {
  app.use(cors({
    origin: true,
    credentials: true
  }));
  logger.info('CORS: All origins allowed (development mode)');
} else {
  const allowedOrigins = env.CORS_ORIGINS ? env.CORS_ORIGINS.split(",").map((o) => o.trim()) : [];
  logger.info(`CORS allowed origins: ${allowedOrigins.join(', ')}`);
  
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      logger.warn(`CORS blocked origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }));
}

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/api", apiLimiter);
app.use("/api/v1", routes);

try {
  const swaggerDoc = YAML.load(path.join(__dirname, "../openapi.yaml"));
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));
} catch (e) {
  logger.warn("openapi.yaml not found");
}

app.use(notFound);
app.use(errorHandler);

const PORT = env.PORT;

if (require.main === module) {
  app.listen(PORT, () => {
    logger.info(`ShopBuilder API v2 running on port ${PORT}`);
    logger.info(`Environment: ${env.NODE_ENV}`);
    logger.info(`Swagger: http://localhost:${PORT}/docs`);
  });
}

module.exports = app;