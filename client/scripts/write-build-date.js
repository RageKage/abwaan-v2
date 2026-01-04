import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const now = new Date()
const year = now.getFullYear()
const month = String(now.getMonth() + 1).padStart(2, '0')
const day = String(now.getDate()).padStart(2, '0')
const buildDate = `${year}.${month}.${day}`

const outputDir = resolve('public')
const outputPath = resolve(outputDir, 'build.json')

mkdirSync(outputDir, { recursive: true })
writeFileSync(outputPath, `${JSON.stringify({ buildDate }, null, 2)}\n`, 'utf-8')
