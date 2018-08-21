'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const Availability = require('../models/availability');

router.post('/', (req, res, next) => {
  const createdAt = new Date();
  const updatedAt = new Date();
  Availability.create({
    spaceId: req.body.spaceId,
    userId: req.user.id,
    createdAt: createdAt,
    updatedAt: updatedAt
  }).then((availability) => {
    res.json({ status: 'OK' });
  });
});

module.exports = router;
