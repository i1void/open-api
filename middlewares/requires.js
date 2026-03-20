export default (route) => (req, res, next) => {
   if (route.parameter?.length > 0) {
      let check
      switch (route.method.toLowerCase()) {
         case 'get': check = global.validator.get(req, route.parameter); break
         case 'post': case 'put': case 'patch': check = global.validator.post(req, route.parameter); break
         case 'delete': check = global.validator.delete(req, route.parameter); break
         default: check = { status: true }
      }
      if (!check.status) return res.status(400).json(check)

      const source = route.method === 'get' ? req.query : req.body
      for (const paramName of route.parameter) {
         const value = source[paramName]
         if (value) {
            let fc = paramName === 'url' ? global.validator.url(value)
                   : paramName === 'number' ? global.validator.number(value)
                   : { status: true }
            if (!fc.status) { fc.msg = `Parameter "${paramName}" has an invalid format. (${fc.msg})`; return res.status(400).json(fc) }
         }
      }
   }
   next()
}
