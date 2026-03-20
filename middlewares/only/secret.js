export default (req, res, next) => {
   const isGet = req.method?.toLowerCase() === 'get'
   const source = isGet ? req.query : req.body

   const check = isGet ? global.validator.get(req, ['secret']) : global.validator.post(req, ['secret'])
   if (!check.status) return res.status(400).json(check)

   for (const paramName in source) {
      if (paramName === 'secret') continue
      const value = source[paramName]
      if (value) {
         let fc = paramName === 'url' ? global.validator.url(value)
                : paramName === 'number' ? global.validator.number(value)
                : { status: true }
         if (!fc.status) { fc.msg = `Parameter "${paramName}" has an invalid format. (${fc.msg})`; return res.status(400).json(fc) }
      }
   }

   if (source.secret !== process.env.SITE_SECRET_KEY)
      return res.status(403).json({ creator: global.creator, status: false, msg: 'Invalid secret key' })

   next()
}
