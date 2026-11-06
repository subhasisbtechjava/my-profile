const { Client } = require("pg");
const config = require("../config/index");

const ensureDatabaseExists = async () => {
  const client = new Client({
    host: config.dbHost,
    port: config.dbPort,
    user: config.dbUser,
    password: config.dbPassword,
    database: "postgres", // Connect to default maintenance database first
  });

  try {
    await client.connect();
    const res = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [config.dbName]
    );

    if (res.rowCount === 0) {
      console.log(`[Database] Database '${config.dbName}' does not exist. Creating...`);
      // Quotes ensure case-sensitivity is preserved if needed
      await client.query(`CREATE DATABASE "${config.dbName}"`);
      console.log(`[Database] Database '${config.dbName}' created successfully.`);
    } else {
      console.log(`[Database] Database '${config.dbName}' already exists.`);
    }
  } catch (err) {
    console.error("[Database] Error checking/creating database:", err.message);
    throw err;
  } finally {
    await client.end();
  }
};

if (require.main === module) {
  ensureDatabaseExists()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = ensureDatabaseExists;
