'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const User = require('../models/user');

router.get('/users', authenticationEnsurer, (req, res, next) => {
  User.findAll({
      order: [['"updatedAt"', 'DESC']]
    }).then((spaces) => {
    res.render('spacelist', {
      loginUser: req.user,
      users: users
    });
  });
});

module.exports = router;
