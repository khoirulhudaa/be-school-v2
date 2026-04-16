const express = require('express');
const router = express.Router();
const aktivitasController = require('../controllers/aktivitasController');

// Endpoint: /api/aktivitas
router.post('/', aktivitasController.syncActivity);
router.get('/history/:siswaId', aktivitasController.getActivityHistory);

// Update lokasi GPS saat buka aplikasi
router.post('/update-location', aktivitasController.updateLocation);

module.exports = router;