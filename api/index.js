/**
 * api/index.js — Vercel serverless entry point
 */
import '../lib/global.js'
import { App, Loader } from '../lib/app.js'
import middleware from '../lib/system/middleware.js'

await Loader.scraper('lib/scraper')

const app = new App({
   name: 'Open-API',
   staticPath: ['public'],
   routePath: 'routers',
   middleware,
   error: (req, res) => res.status(404).json({
      creator: global.creator,
      status: false,
      msg: 'Not found'
   })
})

export default await app.vercel()
