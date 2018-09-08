'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const uuid = require('node-uuid');
const Space = require('../models/space');

router.get('/create', authenticationEnsurer, (req, res, next) => {
  res.render('createspace', { loginUser: req.user });
});

router.post('/create', authenticationEnsurer, (req, res, next) => {
  const spaceId = uuid.v4();
  const updatedAt = new Date();
  Space.create({
    spaceId: spaceId,
    spaceName: req.body.spaceName.slice(0, 255),
    imgPath: req.body.imgPath,
    slackWebhookURL: req.body.slackWebhookURL,
    slackChannel: req.body.slackChannel,
    createdBy: req.user.id,
    updatedAt: updatedAt
  }).then((space) => {
    res.redirect('/');
    //res.redirect('/spaces/' + space.spaceId);
  });
});

module.exports = router;
