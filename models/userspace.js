'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

const UserSpace = loader.database.define('userspace', {
  userSpaceId: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  userId: {
    type: Sequelize.BIGINT,
    allowNull: false
  },
  spaceId: {
    type: Sequelize.UUID,
    allowNull: false
  }
}, {
  freezeTableName: true,
  timestamps: true
});

module.exports = UserSpace;
