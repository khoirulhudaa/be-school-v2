const Student = require('../models/siswa');
const { Op, Sequelize } = require('sequelize');
const StudentLike = require('../models/siswaLike');

// --- BIRO JODOH (Radius Search) ---
exports.getNearbyStudents = async (req, res) => {
  const { lat, lng, radius = 10, schoolId, currentSiswaId } = req.query;

  // Proteksi agar acos tidak error dan presisi terjaga
  const distanceQuery = `(6371 * acos(LEAST(1, GREATEST(-1, cos(radians(${lat})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${lng})) + sin(radians(${lat})) * sin(radians(latitude))))))`;

  try {
    const students = await Student.findAll({
      attributes: { 
        include: [[Sequelize.literal(distanceQuery), 'distance']] 
      },
      where: {
        schoolId,
        isActive: true,
        id: { [Op.ne]: currentSiswaId }, // Jangan jodohkan dengan diri sendiri
        latitude: { [Op.ne]: null },    // Pastikan koordinat ada
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