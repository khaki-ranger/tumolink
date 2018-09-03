'use strict';
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  const title = 'ツモリンク';
  res.render('index', { title: title, loginUser: req.user });
});

module.exports = router;
