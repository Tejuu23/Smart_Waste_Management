const jwt = require('jsonwebtoken');

function auth(requiredRoles = []) {
	return (req, res, next) => {
		const header = req.headers.authorization || '';
		const token = header.startsWith('Bearer ') ? header.substring(7) : null;
		if (!token) return res.status(401).json({ message: 'Unauthorized' });
		try {
			const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
			req.user = payload;
			if (requiredRoles.length > 0 && !requiredRoles.includes(payload.role)) {
				return res.status(403).json({ message: 'Forbidden' });
			}
			return next();
		} catch (e) {
			return res.status(401).json({ message: 'Invalid token' });
		}
	};
}

module.exports = { auth };


