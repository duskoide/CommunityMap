const { Pool } = require("pg");
const { randomUUID } = require("crypto");
const { newDb, DataType } = require("pg-mem");
const { env } = require("../config/env");

let poolPromise = null;
let databaseMode = "postgres";

async function createPool() {
  const postgresPool = new Pool({
    connectionString: env.databaseUrl,
  });

  try {
    await postgresPool.query("SELECT 1");
    databaseMode = "postgres";
    return postgresPool;
  } catch (error) {
    await postgresPool.end().catch(() => undefined);

    const memoryDb = newDb();
    memoryDb.public.registerFunction({
      name: "gen_random_uuid",
      returns: DataType.uuid,
      implementation: () => randomUUID(),
      impure: true,
    });

    const pgAdapter = memoryDb.adapters.createPg();
    const memoryPool = new pgAdapter.Pool();
    databaseMode = "memory";

    console.warn(
      "PostgreSQL tidak tersedia, backend memakai in-memory database untuk mode dev.",
    );

    return memoryPool;
  }
}

async function getPool() {
  if (!poolPromise) {
    poolPromise = createPool();
  }

  return poolPromise;
}

async function query(text, params) {
  const pool = await getPool();
  return pool.query(text, params);
}

async function withTransaction(callback) {
  const pool = await getPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  getPool,
  getDatabaseMode: () => databaseMode,
  query,
  withTransaction,
};
