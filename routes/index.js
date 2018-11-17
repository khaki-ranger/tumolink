'use strict';
const express = require('express');
const router = express.Router();
const loginUser = require('./login-user');
const configVars = require('./config-vars');

router.get('/', (req, res, next) => {
  const title = 'ツモリンク | ツモリをつなげてみんながあつまる';
  loginUser(req.user, (result) => {
    res.render('index', {
      title: title,
      configVars: configVars,
      loginUser: result
    });
  });
});

module.exports = router;
