const fs = require('fs')
const path = require('path')
const mysql = require('mysql2/promise')
const bcrypt = require('bcryptjs')

function loadEnv(envPath) {
  const file = envPath && fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : null
  if (!file) return
  file.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return
    const eq = trimmed.indexOf('=')
    if (eq === -1) return
    const key = trimmed.slice(0, eq).trim()
    let val = trimmed.slice(eq + 1).trim()
    // remove optional surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = val
  })
}

async function getPoolFromEnv() {
  const { DATABASE_URL, MYSQL_HOST, MYSQL_PORT, MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD, MYSQL_SSL } = process.env
  if (DATABASE_URL && DATABASE_URL.startsWith('mysql://')) {
    const url = new URL(DATABASE_URL)
    const host = url.hostname
    const port = url.port ? Number(url.port) : 3306
    const database = url.pathname.replace(/^\//, '')
    const user = decodeURIComponent(url.username)
    const password = decodeURIComponent(url.password)
    const enableSsl = (MYSQL_SSL || 'false').toLowerCase() === 'true'
    return mysql.createPool({ host, port, database, user, password, waitForConnections: true, connectionLimit: 5, ssl: enableSsl ? { rejectUnauthorized: false } : undefined })
  }
  if (!MYSQL_HOST || !MYSQL_DATABASE || !MYSQL_USER) {
    throw new Error('Missing MySQL environment variables. Set DATABASE_URL or MYSQL_HOST, MYSQL_DATABASE, MYSQL_USER')
  }
  const enableSsl = (MYSQL_SSL || 'false').toLowerCase() === 'true'
  return mysql.createPool({ host: MYSQL_HOST, port: MYSQL_PORT ? Number(MYSQL_PORT) : 3306, database: MYSQL_DATABASE, user: MYSQL_USER, password: MYSQL_PASSWORD, waitForConnections: true, connectionLimit: 5, ssl: enableSsl ? { rejectUnauthorized: false } : undefined })
}

async function run() {
  try {
    // Load .env.local from repo root if present
    const repoRootEnv = path.resolve(__dirname, '..', '.env.local')
    loadEnv(repoRootEnv)

    console.log('Using env from:', fs.existsSync(repoRootEnv) ? repoRootEnv : 'process.env')

    const pool = await getPoolFromEnv()
    console.log('Connecting to DB...')
    const [rows] = await pool.query('SELECT 1 AS ok')
    if (rows && rows[0] && (rows[0].ok === 1 || rows[0].ok === '1')) {
      console.log('DB health check: PASS')
    } else {
      console.warn('DB health check: UNEXPECTED RESULT', rows)
    }

    // Ensure users table exists
    try {
      await pool.query('SELECT 1 FROM users LIMIT 1')
      console.log('Users table: exists')
    } catch (e) {
      console.error('Users table check failed. Did you import the schema?', e.message)
      await pool.end()
      process.exit(1)
    }

    // Signup & login simulation
    const testEmail = `test.user.${Date.now()}@example.local`
    const testPassword = 'TestPass!23'
    const passwordHash = await bcrypt.hash(testPassword, 10)

    console.log('Creating test user:', testEmail)
    const [insertResult] = await pool.query('INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)', ['Test User', testEmail, null, passwordHash, 'user'])
    const insertedId = insertResult.insertId || (insertResult && insertResult[0] && insertResult[0].insertId)
    console.log('Inserted user id:', insertedId)

    // Simulate login: fetch hash and compare
    const [userRows] = await pool.query('SELECT id, password_hash FROM users WHERE email = ? LIMIT 1', [testEmail])
    if (!userRows || userRows.length === 0) {
      throw new Error('Inserted user not found')
    }
    const dbHash = userRows[0].password_hash
    const match = await bcrypt.compare(testPassword, dbHash)
    console.log('Login simulation (bcrypt compare):', match ? 'PASS' : 'FAIL')

    // Clean up: delete test user
    await pool.query('DELETE FROM users WHERE email = ?', [testEmail])
    console.log('Cleaned up test user')

    await pool.end()
    process.exit(match ? 0 : 2)
  } catch (err) {
    console.error('DB test failed:', err && err.message ? err.message : err)
    process.exit(1)
  }
}

run()
