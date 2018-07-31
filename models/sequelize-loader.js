'use strict';
const Sequelize = require('sequelize');
const sequelize = new Sequelize(
  'postgres://postgres:postgres@localhost/tumolink',
  { logging: true });

module.exports = {
  database: sequelize,
  Sequelize: Sequelize
};
