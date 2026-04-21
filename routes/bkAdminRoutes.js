const express = require('express');
const router = express.Router();
const bk = require('../controllers/bkAdminController');

// Public
router.post('/login', bk.loginBkAdmin);

router.get('/me', bk.getMe);

// Manajemen admin — hanya super_admin
router.get('/', bk.getAdmins);
router.post('/', bk.createAdmin);
router.put('/:id', bk.updateAdmin);
router.delete('/:id', bk.deleteAdmin);

module.exports = router;