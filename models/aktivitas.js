const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Activity = sequelize.define('Activity', {
  siswaId: { type: DataTypes.INTEGER, allowNull: false },
  tipe: { type: DataTypes.STRING }, // lari, jalan, dll
  jarakMeter: { type: DataTypes.FLOAT },
  durasiDetik: { type: DataTypes.INTEGER },
  kalori: { type: DataTypes.FLOAT },
  points: { type: DataTypes.JSON } // Simpan array [{lat, lng, ts}]
});

module.exports = Activity;