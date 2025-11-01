#!/usr/bin/env node
/*
  Script: fix_demo_passwords.js
  Purpose: Ensure demo admin/user have correct bcrypt password hashes in DB.
  It reads .env.local DB settings, connects to MySQL, and updates password_hash
  for admin@demo.local and user@demo.local.

  Usage:
    node scripts/fix_demo_passwords.js
*/
const fs = require('fs')
const path = require('path')
const mysql = require('mysql2/promise')
const bcrypt = require('bcryptjs')

function parseEnvFile(envPath) {
  if (!fs.existsSync(envPath)) return {}
  const raw = fs.readFileSync(envPath, 'utf8')
  const lines = raw.split(/\r?\n/)
  const out = {}
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    const key = trimmed.slice(0, idx)
    let val = trimmed.slice(idx + 1)
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    out[key] = val
  }
  return out
}

async function main() {
  const repoRoot = path.resolve(__dirname, '..')
  const envPath = path.join(repoRoot, '.env.local')
  const env = parseEnvFile(envPath)

  const MYSQL_HOST = env.MYSQL_HOST || 'localhost'
  const MYSQL_PORT = env.MYSQL_PORT ? Number(env.MYSQL_PORT) : 3306
  const MYSQL_DATABASE = env.MYSQL_DATABASE || 'ecommerce_db'
  const MYSQL_USER = env.MYSQL_USER || 'root'
  const MYSQL_PASSWORD = env.MYSQL_PASSWORD || ''

  const conn = await mysql.createConnection({
    host: MYSQL_HOST,
    port: MYSQL_PORT,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE,
  })

  const updates = [
    { email: 'admin@demo.local', pw: 'ChangeMe123!' },
    { email: 'user@demo.local', pw: 'password123' },
  ]

  for (const u of updates) {
    const hash = await bcrypt.hash(u.pw, 10)
    const [res] = await conn.execute('UPDATE users SET password_hash = ? WHERE email = ?', [hash, u.email])
    console.log('Updated', u.email, 'affectedRows=', res.affectedRows)
  }

  await conn.end()
  console.log('Done. Try logging in with:')
  console.log(' - admin@demo.local / ChangeMe123!')
  console.log(' - user@demo.local  / password123')
}

main().catch(err => { console.error(err); process.exit(1) })
