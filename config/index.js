require("dotenv").config();
const Joi = require("joi");

const envVarsSchema = Joi.object()
  .keys({
    PORT: Joi.number().default(5000),
    BASE_URL: Joi.string().default("http://localhost"),
    ENVIRONMENT: Joi.string()
      .valid("production", "development", "test")
      .default("development"),
    DB_HOST: Joi.string().required().description("Database host"),
    DB_PORT: Joi.number().default(5432).description("Database port"),
    DB_NAME: Joi.string().required().description("Database name"),
    DB_USER: Joi.string().required().description("Database user"),
    DB_PASSWORD: Joi.string().allow("").required().description("Database password"),
    JWT_SECRET: Joi.string().required().description("JWT secret key"),
    JWT_EXPIRATION_DAYS: Joi.number().default(30).description("JWT expiration days"),
    SWAGGER_API: Joi.string().default("http://localhost:5000"),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: "key" } })
  .validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.ENVIRONMENT,
  port: envVars.PORT,
  baseUrl: envVars.BASE_URL,
  dbHost: envVars.DB_HOST,
  dbPort: envVars.DB_PORT,
  dbName: envVars.DB_NAME,
  dbUser: envVars.DB_USER,
  dbPassword: envVars.DB_PASSWORD,
  jwtSecret: envVars.JWT_SECRET,
  jwtExpirationDays: envVars.JWT_EXPIRATION_DAYS,
  swaggerApi: envVars.SWAGGER_API,
};
