'use strict';
const express = require('express');
const router = express.Router();
const loginUser = require('./login-user');

router.get('/', (req, res, next) => {
  const title = 'ツモリンク';
  loginUser(req.user, (result) => {
    res.render('index', {
      title: title,
      loginUser: result
    });
  });
});

module.exports = router;
