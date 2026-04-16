const express = require('express');
const router = express.Router();
const biroJodohController = require('../controllers/biroJodoh');

// Endpoint: /api/birojodoh
router.get('/', biroJodohController.getNearbyStudents);
router.post('/like', biroJodohController.likeStudent);

module.exports = router;