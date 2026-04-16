const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AbsenceRequest = sequelize.define('AbsenceRequest', {
  siswaId: { type: DataTypes.INTEGER, allowNull: false },
  jenis: { type: DataTypes.ENUM('sakit', 'dispensasi', 'keluarga'), allowNull: false },
  tanggalMulai: { type: DataTypes.DATEONLY, allowNull: false },
  tanggalAkhir: { type: DataTypes.DATEONLY, allowNull: false },
  deskripsi: { type: DataTypes.TEXT },
  lampiranUrl: { type: DataTypes.STRING },
  status: { type: DataTypes.ENUM('pending', 'approved', 'rejected'), defaultValue: 'pending' }
});

module.exports = AbsenceRequest;