const adminOnly = (req, res, next) => {
  const userEmail = req.user && req.user.email ? req.user.email.toLowerCase().trim() : '';
  const isSuperAdminEmail = userEmail === 'sakthivijayarajkrv@gmail.com' || userEmail === 'sakthivijayarjkrv@gmail.com';
  
  if (req.user && (req.user.role === 'ADMIN' || isSuperAdminEmail)) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied: Admin privileges are strictly restricted to sakthivijayarajkrv@gmail.com.'
    });
  }
};

module.exports = { adminOnly };
