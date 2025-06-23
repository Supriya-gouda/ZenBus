// Authentication middleware

// Check if user is logged in
const isUserLoggedIn = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ message: 'Unauthorized: Please log in' });
};

// Check if admin is logged in
const isAdminLoggedIn = (req, res, next) => {
  if (req.session && req.session.adminId) {
    return next();
  }
  return res.status(401).json({ message: 'Unauthorized: Admin access required' });
};

module.exports = {
  isUserLoggedIn,
  isAdminLoggedIn
};