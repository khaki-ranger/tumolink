'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const uuid = require('node-uuid');
const Availability = require('../models/availability');
const Slack = require('node-slackr');
const slack = new Slack('https://hooks.slack.com/services/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', {
  username: 'tumolink-boot'
});

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
    const username = req.user.displayName;
    res.json({ status: 'OK' });
    slack.notify(username + 'がツモリンク！', function(err, result){
      console.log(err,result);
    });
  });
});

module.exports = router;
