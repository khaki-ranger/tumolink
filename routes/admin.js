'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const uuid = require('node-uuid');
const User = require('../models/user');
const Space = require('../models/space');
const UserSpace = require('../models/userspace');

router.get('/', authenticationEnsurer, (req, res, next) => {
  res.render('admin/index', {
    loginUser: req.user
  });
});

router.get('/users/list', authenticationEnsurer, (req, res, next) => {
  User.findAll({
    }).then((users) => {
    res.render('admin/userlist', {
      loginUser: req.user,
      users: users
    });
  });
});

router.get('/users/update/:userId', authenticationEnsurer, (req, res, next) => {
  User.findOne({
    where: {
      userId: req.params.userId
    }
  }).then((user) => {
    res.render('admin/userupdate', {
      loginUser: req.user,
      user: user
    });
  });
});

router.get('/spaces/list', authenticationEnsurer, (req, res, next) => {
  Space.findAll({
      order: [['"updatedAt"', 'DESC']]
    }).then((spaces) => {
    res.render('admin/spacelist', {
      loginUser: req.user,
      spaces: spaces
    });
  });
});

router.get('/spaces/create', authenticationEnsurer, (req, res, next) => {
  res.render('admin/spacecreate', {
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
    res.redirect('/admin/spaces/list');
    //res.redirect('/spaces/' + space.spaceId);
  });
});

router.get('/spaces/update/:spaceId', authenticationEnsurer, (req, res, next) => {
  Space.findOne({
    where: {
      spaceId: req.params.spaceId
    }
  }).then((space) => {
    res.render('admin/spaceupdate', {
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
    livelynkUrl: req.body.livelynkUrl,
    updatedAt: updatedAt
  };
  const filter = {
    where: {
      spaceId: req.params.spaceId,
    }
  }
  Space.update(param, filter)
  .then((space) => {
    res.redirect('/admin/spaces/list');
  });
});

router.get('/spaces/delete/:spaceId', authenticationEnsurer, (req, res, next) => {
  Space.destroy({
    where: {
      spaceId: req.params.spaceId,
    }
  }).then((space) => {
    res.redirect('/admin/spaces/list');
  });
});

router.get('/userspace/create', authenticationEnsurer, (req, res, next) => {
  res.render('admin/userspacecreate', {
    loginUser: req.user
  });
});

router.post('/userspace/create', authenticationEnsurer, (req, res, next) => {
  UserSpace.create({
    userId: req.body.userId,
    spaceId: req.body.spaceId
  }).then((space) => {
    res.redirect('/admin');
  });
});

module.exports = router;
