const admin = require('firebase-admin');
const serviceAccount = require('./disco-history-430508-e3-firebase-adminsdk-rns1y-428937fec5.json');

// Pastikan hanya inisialisasi sekali
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;