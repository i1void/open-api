import 'dotenv/config'
import _validate from './system/validator.js'

global.creator = `@neoxr.js – Wildan Izzudin`

global.validator = {
   get: (req, params) => _validate(req.query, params, 'query string'),
   post: (req, params) => _validate(req.body, params, 'body'),
   params: (req, params) => _validate(req.params, params, 'route parameters'),
   delete: (req, params) => {
      if (params.every(p => p in req.params)) return _validate(req.params, params, 'route parameters')
      if (params.every(p => p in req.query)) return _validate(req.query, params, 'query string')
      return _validate(req.body, params, 'body')
   },
   all: (req, rules) => {
      const locations = ['body', 'query', 'params']
      const errors = []
      for (const loc of locations) {
         if (rules[loc]?.length > 0) {
            const label = loc === 'query' ? 'query string' : loc === 'params' ? 'route parameters' : 'body'
            const result = _validate(req[loc], rules[loc], label)
            if (!result.status) errors.push(result.msg)
         }
      }
      if (errors.length > 0) return { creator: global.creator, status: false, msg: errors.join(' ') }
      return { status: true }
   },
   url: (input) => {
      if (!input) return { creator: global.creator, status: false, msg: 'Input value cannot be empty.' }
      try { new URL(input); return { status: true } } catch {
         return { creator: global.creator, status: false, msg: `The value "${input}" is not a valid URL.` }
      }
   },
   number: (input) => {
      if (input === null || input === undefined || String(input).trim() === '')
         return { creator: global.creator, status: false, msg: 'Input value cannot be empty and must be a number.' }
      if (!isFinite(input))
         return { creator: global.creator, status: false, msg: `The value "${input}" must be a valid number.` }
      return { status: true }
   }
}
