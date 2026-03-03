const jwt = require('jsonwebtoken');
const { ACCESS_TOKEN_SECRET } = require('../utils/token');

/**
 * Middleware untuk memverifikasi apakah token JWT valid
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Token tidak ditemukan, silakan login kembali." });
  }

  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Sesi telah berakhir atau token tidak valid." });
    }
    
    // Menyimpan data user (termasuk id dan role) ke dalam object req
    req.user = user;
    next();
  });
};

/**
 * Middleware untuk mengecek apakah user yang login memiliki role 'admin'
 * Digunakan setelah authenticateToken
 */
const isAdmin = (req, res, next) => {
  // Pengecekan apakah req.user ada dan memiliki role admin
  if (req.user && req.user.role === 'admin') {
    next(); // Lanjut ke controller berikutnya
  } else {
    return res.status(403).json({ 
      message: "Akses Ditolak: Fitur ini hanya dapat diakses oleh Admin." 
    });
  }
};

module.exports = { 
  authenticateToken, 
  isAdmin 
};