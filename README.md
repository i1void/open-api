## OPEN-API

> JavaScript (ESM) REST API framework — plugin-based router, zero proprietary dependencies, deployable to Vercel.

### Features

- [x] Plugin as Router (auto-load dari folder `routers/`)
- [x] Auto-load Scrapers
- [x] Request Per Minute Limit
- [x] IP Whitelist / Restrict
- [x] Cloudflare Auto-block
- [x] JWT Authorization
- [x] Premium API Key
- [x] Socket.IO (local/VPS only)
- [x] **Vercel-ready** (tanpa dependency proprietary)

---

### Struktur Folder

```
open-api/
├── api/
│   └── index.js          ← Vercel serverless entry
├── lib/
│   ├── app.js            ← Core App & Loader (pengganti @neoxr/webly)
│   ├── global.js
│   ├── cloudflare.js
│   ├── scraper/
│   │   └── tempo.js
│   └── system/
│       ├── config.js
│       ├── middleware.js
│       └── validator.js
├── middlewares/
│   ├── authorization.js
│   ├── error.js
│   ├── premium.js
│   ├── protector.js
│   ├── requires.js
│   ├── restrict.js
│   ├── rpm.js
│   └── only/
│       └── secret.js
├── routers/
│   ├── index.js
│   └── endpoint/
│       └── example.js
├── public/
│   ├── index.html
│   └── 404.html
├── index.js              ← Local/VPS entry
├── vercel.json
├── pm2.config.cjs
└── package.json
```

---

### Router

```js
// routers/endpoint/my-api.js
import { Loader } from '../../lib/app.js'

export const routes = {
   category: 'main',
   path: '/api/my-endpoint',
   parameter: ['q'],        // required query params
   method: 'get',
   execution: async (req, res) => {
      const result = await Loader.scrapers.myScraper.search(req.query.q)
      res.json(result)
   },
   error: false,            // true = endpoint disabled
   authorize: false,        // true = require JWT
   rpm: true,               // true = rate limit
   protect: false,          // true = Cloudflare auto-block spam
   premium: false,          // true = require apikey param
   restrict: false          // true = IP whitelist only
}
```

### Middleware flags

| Flag        | Fungsi                                      |
|-------------|---------------------------------------------|
| `error`     | Nonaktifkan endpoint (return 503)           |
| `authorize` | Wajib JWT Bearer token                      |
| `rpm`       | Rate limit per IP (lihat `REQUEST_LIMIT`)   |
| `protect`   | Auto-block spam via Cloudflare              |
| `premium`   | Wajib `apikey` query param                  |
| `restrict`  | Hanya IP di whitelist (`lib/system/config`) |

---

### Instalasi & Jalankan

```bash
cp .env.example .env
# edit .env sesuai kebutuhan

npm install
node .
```

Atau pakai PM2:
```bash
npm install -g pm2
pm2 start pm2.config.cjs && pm2 logs
```

---

### Deploy ke Vercel

1. Push repo ke GitHub
2. Import di [vercel.com](https://vercel.com)
3. Tambahkan Environment Variables dari `.env.example` di Vercel dashboard
4. Deploy — selesai!

> ⚠️ Socket.IO **tidak tersedia** di Vercel (serverless). Gunakan VPS/server biasa untuk fitur realtime.

---

### Menambah Scraper

Buat file baru di `lib/scraper/nama.js`, export default instance:

```js
class MyScraper {
   async fetch(q) { ... }
}
export default new MyScraper
```

Otomatis tersedia di `Loader.scrapers.nama`.
