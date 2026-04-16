const Student = require('../models/siswa');
const { Op, Sequelize } = require('sequelize');

// --- UPDATE LOKASI SISWA ---
exports.updateLocation = async (req, res) => {
  const { id, lat, lng } = req.body;
  await Student.update({ latitude: lat, longitude: lng }, { where: { id } });
  res.json({ success: true, message: 'Lokasi diperbarui' });
};

// --- BIRO JODOH (Radius Search) ---
exports.getNearbyStudents = async (req, res) => {
  const { lat, lng, radius = 10, schoolId } = req.query;
  
  // Formula Haversine untuk mencari jarak berdasarkan lat/lng di MySQL/Postgres
  const distanceQuery = `(6371 * acos(cos(radians(${lat})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${lng})) + sin(radians(${lat})) * sin(radians(latitude))))`;

  try {
    const students = await Student.findAll({
      attributes: { 
        include: [[Sequelize.literal(distanceQuery), 'distance']] 
      },
      where: {
        schoolId,
        isActive: true,
        [Op.and]: Sequelize.where(Sequelize.literal(distanceQuery), '<=', radius)
      },
      order: Sequelize.literal('distance ASC')
    });
    res.json({ success: true, data: students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.likeStudent = async (req, res) => {
    try {
        const { fromSiswaId, toSiswaId } = req.body;

        // Simpan like
        await StudentLike.create({ fromSiswaId, toSiswaId });

        // Cek apakah "match" (dia sudah like balik?)
        const isMatch = await StudentLike.findOne({
            where: {
                fromSiswaId: toSiswaId,
                toSiswaId: fromSiswaId
            }
        });

        res.json({ 
            success: true, 
            match: !!isMatch,
            message: isMatch ? 'Wah, kalian saling suka! (Match)' : 'Berhasil menyukai'
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};