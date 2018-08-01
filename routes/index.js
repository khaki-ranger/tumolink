'use strict';
var express = require('express');
var router = express.Router();
var Space = require('../models/space');

/* GET home page. */
router.get('/', function(req, res, next) {
  const title = 'ツモリンク';
  if (req.user) {
    Space.findAll({
      where: {
        createdBy: req.user.id
      },
      order: [['"updatedAt"', 'DESC']]
    }).then((spaces) => {
      res.render('index', {
        title: title,
        loginUser: req.user,
        spaces: spaces
      });
    });
  } else {
    res.render('index', { title: title, loginUser: req.user });
  }
});

module.exports = router;
