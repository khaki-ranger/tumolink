'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const uuid = require('node-uuid');
const Space = require('../models/space');

router.get('/list', authenticationEnsurer, (req, res, next) => {
  Space.findAll({
      order: [['"updatedAt"', 'DESC']]
    }).then((spaces) => {
    res.render('spacelist', {
      loginUser: req.user,
      spaces: spaces
    });
  });
});

module.exports = router;
