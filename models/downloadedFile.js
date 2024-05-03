const { Model, DataTypes } = require('sequelize');
const sequelize = require('../util/database');

class DownloadedFile extends Model {}

DownloadedFile.init({
  fileURl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  downloadedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  modelName: 'downloadedFile',
});

module.exports = DownloadedFile;