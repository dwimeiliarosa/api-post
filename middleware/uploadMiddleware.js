const multer = require('multer');

// Gunakan memoryStorage agar file tidak langsung ditulis ke disk
// tapi disimpan di buffer untuk diproses oleh Sharp
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // Batasi maksimal 2MB
  },
  fileFilter: (req, file, cb) => {
    // Hanya izinkan file gambar
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Hanya file gambar yang diperbolehkan!'), false);
    }
  }
});

module.exports = upload;