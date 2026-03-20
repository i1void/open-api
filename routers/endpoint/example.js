import { Loader } from '../../lib/app.js'

export const routes = {
   category: 'main',
   path: '/api/tempo',
   parameter: ['q'],
   method: 'get',
   execution: async (req, res) => {
      const json = await Loader.scrapers.tempo.search(req.query.q)
      res.json(json)
   },
   error: false,
   rpm: true,
   premium: true
}
