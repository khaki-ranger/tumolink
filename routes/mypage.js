'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const User = require('../models/user');

router.get('/', authenticationEnsurer, (req, res, next) => {
  const title = 'マイページ | ツモリンク';
  User.findOne({
    where: {
      userId: req.user.id
    }
  }).then((user) => {
    res.render('mypage', {
      loginUser: req.user,
      user: user
    });
  });
});

module.exports = router;
