import mysql from "mysql2/promise"

type QueryExecutor = mysql.Pool | mysql.PoolConnection

declare global {
  // eslint-disable-next-line no-var
  var __mysqlPool: mysql.Pool | undefined
}

export function getPool() {
  if (!global.__mysqlPool) {
    const { DATABASE_URL, MYSQL_HOST, MYSQL_PORT, MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD, MYSQL_SSL, MYSQL_CONNECTION_LIMIT } = process.env
    // Prefer DATABASE_URL if provided (e.g., mysql://user:pass@host:3306/db?params)
    if (DATABASE_URL && DATABASE_URL.startsWith("mysql://")) {
      // Optional SSL support via env flag
      const enableSsl = (MYSQL_SSL || "false").toLowerCase() === "true"
      // Parse the DATABASE_URL into PoolOptions to reliably attach SSL and other options
      const url = new URL(DATABASE_URL)
      const host = url.hostname
      const port = url.port ? Number(url.port) : 3306
      const database = url.pathname.replace(/^\//, "")
      const user = decodeURIComponent(url.username)
      const password = decodeURIComponent(url.password)

      global.__mysqlPool = mysql.createPool({
        host,
        port,
        database,
        user,
        password,
        connectionLimit: MYSQL_CONNECTION_LIMIT ? Number(MYSQL_CONNECTION_LIMIT) : 10,
        waitForConnections: true,
        ssl: enableSsl ? { rejectUnauthorized: false } : undefined,
      })
    } else {
      // Fall back to discrete MYSQL_* vars
      if (!MYSQL_HOST || !MYSQL_DATABASE || !MYSQL_USER) {
        throw new Error("Missing MySQL environment variables: MYSQL_HOST, MYSQL_DATABASE, MYSQL_USER or DATABASE_URL")
      }

      const enableSsl = (MYSQL_SSL || "false").toLowerCase() === "true"
      global.__mysqlPool = mysql.createPool({
        host: MYSQL_HOST,
        port: MYSQL_PORT ? Number(MYSQL_PORT) : 3306,
        database: MYSQL_DATABASE,
        user: MYSQL_USER,
        password: MYSQL_PASSWORD,
        connectionLimit: MYSQL_CONNECTION_LIMIT ? Number(MYSQL_CONNECTION_LIMIT) : 10,
        waitForConnections: true,
        ssl: enableSsl ? { rejectUnauthorized: false } : undefined,
      })
    }
  }
  return global.__mysqlPool
}

export async function query<T = any>(sql: string, params: any[] = [], executor?: QueryExecutor) {
  const runner = executor ?? getPool()
  const [rows] = await runner.execute(sql, params)
  return rows as T
}

export async function withTransaction<T>(fn: (conn: mysql.PoolConnection) => Promise<T>) {
  const pool = getPool()
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const result = await fn(connection)
    await connection.commit()
    return result
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}
