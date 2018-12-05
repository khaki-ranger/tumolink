'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

const Googlehome = loader.database.define('googlehome', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  spaceId: {
    type: Sequelize.UUID,
    allowNull: false
  },
  userId: {
    type: Sequelize.BIGINT,
    allowNull: false
  },
  text: {
    type: Sequelize.STRING,
    allowNull: false
  },
  posted: {
    type: Sequelize.BOOLEAN,
    allowNull: false
  }
}, {
  freezeTableName: true,
  timestamps: true
});

module.exports = Googlehome;
    
