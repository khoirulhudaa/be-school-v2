const Izin = require('../models/izin'); // Pastikan sudah dibuat
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Konfigurasi Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- 2. MANAJEMEN IZIN ---
exports.submitIzin = async (req, res) => {
    try {
        const { siswaId, jenis, tanggalMulai, tanggalAkhir, deskripsi } = req.body;
        let lampiranUrl = null;

        if (req.file) {
            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: 'izin_siswa', resource_type: 'auto' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
            });
            lampiranUrl = result.secure_url;
        }

        const newIzin = await Izin.create({
            siswaId, jenis, tanggalMulai, tanggalAkhir, deskripsi, lampiranUrl
        });

        res.json({ success: true, data: newIzin });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateIzinStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' atau 'rejected'

    const izin = await Izin.findByPk(id);
    if (!izin) return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });

    izin.status = status;
    await izin.save();

    res.json({ success: true, message: `Izin berhasil di-${status}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getIzinHistory = async (req, res) => {
    try {
        const { siswaId } = req.params;
        const history = await Izin.findAll({
            where: { siswaId },
            order: [['createdAt', 'DESC']]
        });
        res.json({ success: true, data: history });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
