import './lib/global.js'
import { App, Loader } from './lib/app.js'
import middleware from './lib/system/middleware.js'

await Loader.scraper('./lib/scraper')

const app = new App({
   name: 'Open-API',
   staticPath: ['public'],
   routePath: './routers',
   middleware,
   port: process.env.PORT || 3000,
   error: (req, res) => {
      res.status(404).sendFile('public/404.html', { root: process.cwd() })
   }
})

app.start()
