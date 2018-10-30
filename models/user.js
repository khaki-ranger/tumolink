'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

const User = loader.database.define('users', {
  userId: {
    type: Sequelize.BIGINT,
    primaryKey: true,
    allowNull: false
  },
  username: {
    type: Sequelize.STRING,
    allowNull: false
  },
  displayName: {
    type: Sequelize.STRING,
    allowNull: true
  },
  profileUrl: {
    type: Sequelize.STRING,
    allowNull: true
  },
  photoUrl: {
    type: Sequelize.STRING,
    allowNull: true
  }
}, {
    freezeTableName: true,
    timestamps: false
  });

module.exports = User;
