const path = require("path");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

// Load OpenAPI 3.0 specification
const swaggerPath = path.join(__dirname, "swagger.yaml");
const swaggerDocument = YAML.load(swaggerPath);

// Custom Natours emerald styling for Swagger UI
const customCss = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  
  body, .swagger-ui {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
  }
  
  .swagger-ui .topbar {
    background: linear-gradient(135deg, #1e3c2f 0%, #0d2019 100%) !important;
    border-bottom: 2px solid #55c57a;
    padding: 12px 0;
  }

  .swagger-ui .topbar .topbar-wrapper .link span {
    display: inline-block;
    color: #55c57a !important;
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 0.5px;
  }

  .swagger-ui .info {
    margin: 30px 0;
  }

  .swagger-ui .info .title {
    font-size: 32px;
    color: #1e3c2f;
    font-weight: 700;
  }

  .swagger-ui .info .title small.version-stamp {
    background-color: #55c57a;
    border-radius: 4px;
    padding: 3px 8px;
    font-size: 13px;
  }

  .swagger-ui .btn.authorize {
    background: linear-gradient(to right, #55c57a, #28b487) !important;
    color: #fff !important;
    border: none !important;
    border-radius: 6px;
    font-weight: 600;
    box-shadow: 0 4px 10px rgba(40, 180, 135, 0.25);
    transition: all 0.2s ease;
  }

  .swagger-ui .btn.authorize:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 14px rgba(40, 180, 135, 0.35);
  }

  .swagger-ui .btn.authorize svg {
    fill: #fff !important;
  }

  .swagger-ui .opblock.opblock-get {
    border-color: #61affe;
    background: rgba(97, 175, 254, 0.05);
  }

  .swagger-ui .opblock.opblock-post {
    border-color: #55c57a;
    background: rgba(85, 197, 122, 0.05);
  }

  .swagger-ui .opblock.opblock-post .opblock-summary-method {
    background: #55c57a;
  }

  .swagger-ui .opblock.opblock-patch {
    border-color: #fca130;
    background: rgba(252, 161, 48, 0.05);
  }

  .swagger-ui .opblock.opblock-delete {
    border-color: #f93e3e;
    background: rgba(249, 62, 62, 0.05);
  }

  .swagger-ui .opblock {
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
    margin-bottom: 12px;
  }

  .swagger-ui section.models {
    border-radius: 8px;
    border: 1px solid #e2e8f0;
  }
`;

const swaggerUiOptions = {
  customCss,
  customSiteTitle: "Natours API Documentation",
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: "list",
    filter: true,
    defaultModelsExpandDepth: 2,
    defaultModelExpandDepth: 2,
  },
};

/**
 * Configures and mounts Swagger UI and raw spec endpoints onto an Express app.
 * @param {import('express').Application} app
 */
const setupSwagger = (app) => {
  // Serve raw JSON spec
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.status(200).send(swaggerDocument);
  });

  // Serve raw YAML spec
  app.get("/api-docs.yaml", (req, res) => {
    res.setHeader("Content-Type", "text/yaml");
    res.status(200).sendFile(swaggerPath);
  });

  // Redirect /docs to /api-docs for quick access
  app.get("/docs", (req, res) => {
    res.redirect("/api-docs");
  });

  // Middleware to disable Content-Security-Policy on Swagger UI routes
  // preventing Helmet from blocking Swagger UI scripts, inline styles, and CDNs
  const disableCspForSwagger = (req, res, next) => {
    res.removeHeader("Content-Security-Policy");
    res.removeHeader("Content-Security-Policy-Report-Only");
    next();
  };

  // Mount Swagger UI
  app.use(
    "/api-docs",
    disableCspForSwagger,
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, swaggerUiOptions)
  );
};

module.exports = {
  setupSwagger,
  swaggerDocument,
};
