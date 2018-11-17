'use strict';
var express = require('express');
var router = express.Router();
const loginUser = require('./login-user');
const configVars = require('./config-vars');

router.get('/', function(req, res, next) {
  const title = 'プライバシーポリシー | ツモリンク';
  loginUser(req.user, (result) => {
    res.render('privacy', {
      title: title,
      configVars: configVars,
      loginUser: result
    });
  });
});

module.exports = router;
