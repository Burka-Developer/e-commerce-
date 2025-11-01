#!/usr/bin/env node
/* Quick-and-dirty secret scanner. Prints matches; does not exit nonzero. */
const fs = require('fs')
const path = require('path')

const ROOT = process.cwd()
const IGNORE = new Set(['node_modules', '.git', '.next', '.vercel'])

const patterns = [
  /AIza[0-9A-Za-z\-_]{20,}/g, // Google API key
  /hf_[A-Za-z0-9\-_]{10,}/g,  // HF token
  /GOCSPX-[0-9A-Za-z\-_]{10,}/g, // Google client secret-ish
  /PAYTABS_[A-Z_]*?=.+/g,      // PayTabs envs in code
  /mysql:\/\/[A-Za-z0-9_%\-]+:[A-Za-z0-9_%\-]+@/g, // DB URLs with creds
]

function scanFile(file) {
  try {
    const content = fs.readFileSync(file, 'utf8')
    for (const re of patterns) {
      const matches = content.match(re)
      if (matches && matches.length) {
        console.log(`[secret?] ${file} -> ${[...new Set(matches)].slice(0,5).join(', ')}`)
      }
    }
  } catch {}
}

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE.has(ent.name)) continue
    const full = path.join(dir, ent.name)
    if (ent.isDirectory()) walk(full)
    else if (ent.isFile()) scanFile(full)
  }
}

walk(ROOT)
console.log('Secret scan completed.')
