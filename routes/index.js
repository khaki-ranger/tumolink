'use strict';
const express = require('express');
const router = express.Router();
const Space = require('../models/space');

router.get('/', (req, res, next) => {
  Space.findAll({
      order: [['"updatedAt"', 'DESC']]
    }).then((spaces) => {
    res.render('index', {
      loginUser: req.user,
      spaces: spaces
    });
  });
});

module.exports = router;
