// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const adminFirebase = require('../config/firebase');
const notifMiddleware = require('../middlewares/notifMiddleware');

// Admin subscribe ke topic sekolahnya
// Dipanggil saat: (1) login, (2) browser dapat FCM token baru
router.post('/subscribe-topic', notifMiddleware, async (req, res) => {
  const { fcmToken } = req.body;
  const { schoolId } = req.user; // dari JWT admin

  if (!fcmToken) {
    return res.status(400).json({ success: false, message: 'fcmToken wajib diisi' });
  }

  const topic = `school_absensi_${schoolId}`;

  try {
    await adminFirebase.messaging().subscribeToTopic([fcmToken], topic);
    res.json({ success: true, message: `Subscribed ke topic ${topic}` });
  } catch (err) {
    console.error('Subscribe topic error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin unsubscribe saat logout
router.post('/unsubscribe-topic', notifMiddleware, async (req, res) => {
  const { fcmToken } = req.body;
  const { schoolId } = req.user;

  if (!fcmToken) {
    return res.status(400).json({ success: false, message: 'fcmToken wajib diisi' });
  }

  const topic = `school_absensi_${schoolId}`;

  try {
    await adminFirebase.messaging().unsubscribeFromTopic([fcmToken], topic);
    res.json({ success: true, message: `Unsubscribed dari topic ${topic}` });
  } catch (err) {
    console.error('Unsubscribe topic error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;