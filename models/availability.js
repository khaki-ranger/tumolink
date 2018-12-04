'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

const Availability = loader.database.define('availabilities', {
  availabilityId: {
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
  arrivingAt: {
    type: Sequelize.DATE,
    allowNull: true
  },
  leavingAt: {
    type: Sequelize.DATE,
    allowNull: true
  },
  visibility: {
    type: Sequelize.BOOLEAN,
    allowNull: false
  },
  postedGoogleHome: {
    type: Sequelize.BOOLEAN,
    allowNull: false
  }
}, {
  freezeTableName: true,
  timestamps: true
});

module.exports = Availability;
    
