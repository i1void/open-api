/**
 * lib/app.js
 * Core Express app factory — no Socket.IO, Vercel-compatible
 */
import express from 'express'
import { readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import cookieParser from 'cookie-parser'
import cookieSession from 'cookie-session'
import cors from 'cors'
import morgan from 'morgan'

// Absolute path of the project root (works on Vercel too)
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

async function findFiles(dir, ext = '.js') {
   let results = []
   const entries = await readdir(dir, { withFileTypes: true })
   for (const entry of entries) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) results = results.concat(await findFiles(full, ext))
      else if (entry.name.endsWith(ext)) results.push(full)
   }
   return results
}

export const Loader = {
   scrapers: {},
   async scraper(scraperDir) {
      // Always resolve relative to project root
      const absDir = path.isAbsolute(scraperDir)
         ? scraperDir
         : path.join(ROOT, scraperDir)
      const files = await findFiles(absDir)
      for (const file of files) {
         const mod = await import(pathToFileURL(file).href)
         this.scrapers[path.basename(file, '.js')] = mod.default ?? mod
      }
   }
}

export class App {
   constructor(opts = {}) {
      this.opts = opts
      this.express = express()
      this._setup()
   }

   _setup() {
      const { express: app, opts } = this

      app.use(cors())
      app.use(morgan('tiny'))
      app.use(express.json())
      app.use(express.urlencoded({ extended: true }))
      app.use(cookieParser())
      app.use(cookieSession({
         name: 'session',
         secret: process.env.SITE_SECRET_KEY ?? 'secret',
         maxAge: 24 * 60 * 60 * 1000
      }))

      // Static files — resolve from project root
      for (const sp of opts.staticPath ?? []) {
         const absPath = path.isAbsolute(sp) ? sp : path.join(ROOT, sp)
         app.use(express.static(absPath))
      }
   }

   async _loadRoutes() {
      const routeDir = path.isAbsolute(this.opts.routePath)
         ? this.opts.routePath
         : path.join(ROOT, this.opts.routePath)

      const files = await findFiles(routeDir)
      for (const file of files) {
         const mod = await import(pathToFileURL(file).href)
         const route = mod.routes
         if (!route?.path || !route?.method) continue
         const mws = this.opts.middleware ? this.opts.middleware(route) : []
         this.express[route.method.toLowerCase()](route.path, ...mws, route.execution)
      }
   }

   // Local dev
   async start() {
      await this._loadRoutes()
      if (this.opts.error) this.express.use(this.opts.error)
      const port = this.opts.port ?? 3000
      this.express.listen(port, () =>
         console.log(`[${this.opts.name ?? 'App'}] http://localhost:${port}`)
      )
   }

   // Vercel — returns express handler
   async vercel() {
      await this._loadRoutes()
      if (this.opts.error) this.express.use(this.opts.error)
      return this.express
   }
}
