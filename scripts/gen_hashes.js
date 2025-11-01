#!/usr/bin/env node
const bcrypt = require('bcryptjs')

async function run() {
  const adminPw = 'ChangeMe123!'
  const userPw = 'password123'
  const [h1, h2] = await Promise.all([
    bcrypt.hash(adminPw, 10),
    bcrypt.hash(userPw, 10),
  ])
  console.log(JSON.stringify({ admin: { pw: adminPw, hash: h1 }, user: { pw: userPw, hash: h2 } }, null, 2))
}

run().catch(err => { console.error(err); process.exit(1) })
