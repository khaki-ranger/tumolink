'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const uuid = require('node-uuid');
const Availability = require('../models/availability');

router.post('/', authenticationEnsurer, (req, res, next) => {
  const availabilityId = uuid.v4();
  const createdAt = new Date();
  const updatedAt = new Date();
  Availability.create({
    availabilityId: availabilityId,
    spaceId: req.body.spaceId,
    userId: req.user.id,
    createdAt: createdAt,
    updatedAt: updatedAt
  }).then((availability) => {
    res.json({ status: 'OK' });
  });
});

module.exports = router;
