'use strict';
const express = require('express');
const router = express.Router();
const Space = require('../models/space');

router.get('/', (req, res, next) => {
  const title = 'ツモリンク';
  Space.findAll({
      order: [['"updatedAt"', 'DESC']]
    }).then((spaces) => {
    res.render('index', {
      title: title,
      loginUser: req.user,
      spaces: spaces
    });
  });
});

module.exports = router;
