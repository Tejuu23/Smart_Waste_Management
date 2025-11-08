const jwt = require('jsonwebtoken')

function requireAuth(roles = []) {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies.token
    if (!token) return res.status(401).json({ error: 'Unauthorized' })
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret')
      if (roles.length && !roles.includes(payload.role)) {
        return res.status(403).json({ error: 'Forbidden' })
      }
      req.user = payload
      next()
    } catch {
      return res.status(401).json({ error: 'Invalid token' })
    }
  }
}

module.exports = { requireAuth }


