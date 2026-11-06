const swaggerJsDoc = require("swagger-jsdoc");
const config = require("../config/index");

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "EventPlanner API",
      version: "1.0.0",
      description: "Comprehensive REST API documentation for EventPlanner built with Express, PostgreSQL, and Sequelize.",
      contact: {
        name: "EventPlanner Team",
      },
    },
    servers: [
      {
        url: config.swaggerApi || `http://localhost:${config.port}`,
        description: "Development Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: [
    "./module/**/*.routes.js",
    "./indexroute/*.js",
  ],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = swaggerDocs;
