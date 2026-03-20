import requestIp from 'request-ip'

const ipRequests = new Map()

export default (req, res, next) => {
   const userIP = requestIp.getClientIp(req)
   const now = Date.now()
   if (!ipRequests.has(userIP)) ipRequests.set(userIP, [])
   const filtered = ipRequests.get(userIP).filter(t => now - t < 60000)
   if (filtered.length >= process.env.REQUEST_LIMIT)
      return res.status(429).json({ creator: global.creator, status: false, msg: 'Too many requests' })
   filtered.push(now)
   ipRequests.set(userIP, filtered)
   next()
}
