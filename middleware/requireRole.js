function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    try {
      const user = req.user;
      const role = user?.user_metadata?.role || user?.role || null;
      if (!role) return res.status(403).json({ error: 'Forbidden: missing role' });
      if (!allowedRoles.includes(role)) return res.status(403).json({ error: 'Forbidden: insufficient role' });
      return next();
    } catch (e) {
      console.error('requireRole error', e);
      return res.status(500).json({ error: 'Role check failed' });
    }
  };
}

module.exports = requireRole;
