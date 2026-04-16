const Activity = require('../models/aktivitas'); // Pastikan sudah dibuat

exports.syncActivity = async (req, res) => {
    try {
        const { siswaId, tipe, jarakMeter, durasiDetik, kalori, points } = req.body;
        // Points biasanya dikirim sebagai array object, Sequelize akan otomatis convert ke JSON jika modelnya diset JSON
        const activity = await Activity.create({
            siswaId, tipe, jarakMeter, durasiDetik, kalori, points
        });
        res.json({ success: true, data: activity });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getActivityHistory = async (req, res) => {
    try {
        const { siswaId } = req.params;
        const history = await Activity.findAll({
            where: { siswaId },
            order: [['createdAt', 'DESC']]
        });
        res.json({ success: true, data: history });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// --- UPDATE LOKASI SISWA ---
exports.updateLocation = async (req, res) => {
  const { id, lat, lng } = req.body;
  await Student.update({ latitude: lat, longitude: lng }, { where: { id } });
  res.json({ success: true, message: 'Lokasi diperbarui' });
};