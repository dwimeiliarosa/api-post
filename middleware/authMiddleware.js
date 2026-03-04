const jwt = require('jsonwebtoken');
const { ACCESS_TOKEN_SECRET } = require('../utils/token');

/**
 * Middleware untuk memverifikasi apakah token JWT valid
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      status: 'error',
      message: "Token tidak ditemukan, silakan login kembali." 
    });
  }

  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        status: 'error',
        message: "Sesi telah berakhir atau token tidak valid." 
      });
    }
    
    // Menyimpan data user (termasuk id dan role) ke dalam object req
    req.user = user;
    next();
  });
};

/**
 * Middleware untuk mengecek apakah user yang login memiliki role 'admin'
 */
const isAdmin = (req, res, next) => {
  // Log ini sangat membantu saat debugging, seperti yang terlihat di terminal kamu
  console.log("--- ADMIN CHECK ---");
  console.log("User ID   :", req.user?.id);
  console.log("User Role :", req.user?.role);
  console.log("-------------------");

  if (!req.user || String(req.user.role).toLowerCase() !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Akses Ditolak: Fitur ini hanya dapat diakses oleh Admin.'
    });
  }
  next();
};

module.exports = { 
  authenticateToken, 
  isAdmin 
};