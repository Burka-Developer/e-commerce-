#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

function rmrf(target) {
  if (!fs.existsSync(target)) return
  const stat = fs.lstatSync(target)
  if (stat.isDirectory()) {
    for (const e of fs.readdirSync(target)) rmrf(path.join(target, e))
    fs.rmdirSync(target)
  } else {
    fs.unlinkSync(target)
  }
}

for (const d of ['.next', 'build']) {
  const full = path.join(process.cwd(), d)
  if (fs.existsSync(full)) {
    console.log(`Removing ${full}`)
    rmrf(full)
  }
}
console.log('Cleanup completed.')
