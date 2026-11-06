const { Sequelize } = require("sequelize");
const config = require("./index");
const ensureDatabaseExists = require("../scripts/initDb");

const sequelize = new Sequelize(config.dbName, config.dbUser, config.dbPassword, {
  host: config.dbHost,
  port: parseInt(config.dbPort, 10) || 5432,
  dialect: "postgres",
   dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },

  logging: config.env === "development" ? (msg) => console.log(`[SQL] ${msg}`) : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

const connectDB = async () => {
  try {
    await ensureDatabaseExists();
    await sequelize.authenticate();
    console.log("[Sequelize] PostgreSQL Connected Successfully to database:", config.dbName);

    // Sync all defined models with database schema
    await sequelize.sync({ alter: true });
    console.log("[Sequelize] All Database Tables Synced Successfully!");

    const seedMasterData = require("./seeders/index");
    await seedMasterData();
  } catch (error) {
    console.error("========== PostgreSQL Connection Error ==========");
    console.error(error.message);
  }
};

module.exports = {
  sequelize,
  connectDB,
};
