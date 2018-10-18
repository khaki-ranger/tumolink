'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

const Space = loader.database.define('spaces', {
  spaceId: {
    type: Sequelize.UUID,
    primaryKey: true,
    allowNull: false
  },
  spaceName: {
    type: Sequelize.STRING,
    allowNull: false
  },
  imgPath: {
    type: Sequelize.STRING,
    allowNull: false
  },
  slackWebhookURL : {
    type: Sequelize.STRING,
    allowNull: true
  },
  slackChannel : {
    type: Sequelize.STRING,
    allowNull: true
  },
  livelynkUrl : {
    type: Sequelize.STRING,
    allowNull: true
  },
  createdBy: {
    type: Sequelize.BIGINT,
    allowNull: false
  },
  updatedAt: {
    type: Sequelize.DATE,
    allowNull: false
  }
}, {
    freezeTableName: true,
    timestamps: false,
    indexes: [
      {
        fields: ['createdBy']
      }
    ]
  });

module.exports = Space;
