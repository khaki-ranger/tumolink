'use strict';
var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  const title = 'プライバシーポリシー';
  res.render('privacy', {
    loginUser: req.user,
    title: title
  });
});

module.exports = router;
