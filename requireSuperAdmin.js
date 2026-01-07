// middleware/requireSuperAdmin.js
function requireSuperAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Access denied: super admin only' });
  }
  next();
}
module.exports = requireSuperAdmin;