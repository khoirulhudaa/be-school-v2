// models/StudentLike.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StudentLike = sequelize.define('StudentLike', {
  fromSiswaId: { type: DataTypes.INTEGER, allowNull: false },
  toSiswaId: { type: DataTypes.INTEGER, allowNull: false }
}, {
  indexes: [{ unique: true, fields: ['fromSiswaId', 'toSiswaId'] }]
});

module.exports = StudentLike;