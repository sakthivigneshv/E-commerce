const sellerOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'SELLER' || req.user.role === 'ADMIN')) {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied: Seller portal access required' });
  }
};

const verifiedSellerOnly = (req, res, next) => {
  // Admin is always granted verified seller privileges
  if (req.user && req.user.role === 'ADMIN') {
    return next();
  }
  
  if (req.user && req.user.role === 'SELLER' && req.user.sellerStatus === 'VERIFIED') {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied: Your seller account requires Admin verification before performing this action.'
  });
};

module.exports = { sellerOnly, verifiedSellerOnly };
