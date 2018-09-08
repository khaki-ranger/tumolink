'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const uuid = require('node-uuid');
const Space = require('../models/space');

router.get('/list', authenticationEnsurer, (req, res, next) => {
  Space.findAll({
      order: [['"updatedAt"', 'DESC']]
    }).then((spaces) => {
    res.render('spacelist', {
      loginUser: req.user,
      spaces: spaces
    });
  });
});

router.get('/create', authenticationEnsurer, (req, res, next) => {
  res.render('spacecreate', {
    loginUser: req.user
  });
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

router.get('/update/:spaceId', authenticationEnsurer, (req, res, next) => {
  Space.findOne({
    where: {
      spaceId: req.params.spaceId
    }
  }).then((space) => {
    res.render('spaceupdate', {
      loginUser: req.user,
      space: space
    });
  });
});

router.post('/update/:spaceId', authenticationEnsurer, (req, res, next) => {
  const updatedAt = new Date();
  const param = {
    spaceName: req.body.spaceName.slice(0, 255),
    imgPath: req.body.imgPath,
    slackWebhookURL: req.body.slackWebhookURL,
    slackChannel: req.body.slackChannel,
    updatedAt: updatedAt
  };
  const filter = {
    where: {
      spaceId: req.params.spaceId,
    }
  }
  Space.update(param, filter)
  .then((space) => {
    res.redirect('/');
  });
});

module.exports = router;
