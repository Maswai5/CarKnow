// Middleware to verify JWT and attach user info to request
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Expect "Bearer <token>"

    if (!token) {
        return res.status(401).json({ error: 'Access denied' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
            impersonatedBy: decoded.impersonatedBy || null // 👈 optional field
        };

        console.log(`Verified user: ${req.user.email} with role: ${req.user.role}` +
          (req.user.impersonatedBy ? ` (impersonated by ${req.user.impersonatedBy})` : ''));

        next();
    } catch (err) {
        console.error('JWT verification failed:', err.message);
        res.status(403).json({ error: 'Invalid token' });
    }
}

module.exports = verifyToken;