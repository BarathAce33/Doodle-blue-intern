const jwt = require('jsonwebtoken');

// auth middleware
exports.auth = (req: any, res: any, next: any) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ status: 401, message: 'No token, access denied' });
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded.id; 
    next();
  } catch (err) {
    res.status(401).json({ status: 401, message: 'Token invalid' });
  }
};

export {};
