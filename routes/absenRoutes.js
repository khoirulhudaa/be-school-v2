const express = require('express');
const router = express.Router();
const absenController = require('../controllers/absenController');
const multer = require('multer');

const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } 
});

// Endpoint: /api/izin (atau sesuaikan di app.js)
router.post('/', upload.single('lampiran'), absenController.submitIzin);
router.get('/history/:siswaId', absenController.getIzinHistory);

module.exports = router;