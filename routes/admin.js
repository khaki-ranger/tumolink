'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const uuid = require('node-uuid');
const Space = require('../models/space');

router.get('/spaces/list', authenticationEnsurer, (req, res, next) => {
  Space.findAll({
      order: [['"updatedAt"', 'DESC']]
    }).then((spaces) => {
    res.render('spacelist', {
      loginUser: req.user,
      spaces: spaces
    });
  });
});

router.get('/spaces/create', authenticationEnsurer, (req, res, next) => {
  res.render('spacecreate', {
    loginUser: req.user
  });
});

router.post('/spaces/create', authenticationEnsurer, (req, res, next) => {
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
    res.redirect('/spaces/list');
    //res.redirect('/spaces/' + space.spaceId);
  });
});

router.get('/spaces/update/:spaceId', authenticationEnsurer, (req, res, next) => {
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

router.post('/spaces/update/:spaceId', authenticationEnsurer, (req, res, next) => {
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
    res.redirect('/spaces/list');
  });
});

router.get('/spaces/delete/:spaceId', authenticationEnsurer, (req, res, next) => {
  Space.destroy({
    where: {
      spaceId: req.params.spaceId,
    }
  }).then((space) => {
    res.redirect('/spaces/list');
  });
});

module.exports = router;
