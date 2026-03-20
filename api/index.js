/**
 * api/index.js — Vercel serverless entry point
 */
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

// Set ROOT agar lib/app.js bisa resolve path dengan benar
process.env.APP_ROOT = ROOT

import '../lib/global.js'
import { App, Loader } from '../lib/app.js'
import middleware from '../lib/system/middleware.js'

await Loader.scraper(path.join(ROOT, 'lib/scraper'))

const app = new App({
   name: 'Open-API',
   staticPath: [path.join(ROOT, 'public')],
   routePath: path.join(ROOT, 'routers'),
   middleware,
   error: (req, res) => res.status(404).json({
      creator: global.creator,
      status: false,
      msg: 'Not found'
   })
})

export default await app.vercel()
