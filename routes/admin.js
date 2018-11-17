'use strict';
const express = require('express');
const router = express.Router();
const adminEnsurer = require('./admin-ensurer');
const loginUser = require('./login-user');
const configVars = require('./config-vars');
const uuid = require('node-uuid');
const User = require('../models/user');
const Space = require('../models/space');
const UserSpace = require('../models/userspace');

router.get('/', adminEnsurer, (req, res, next) => {
  loginUser(req.user, (result) => {
    res.render('admin/index', {
      configVars: configVars,
      loginUser: result
    });
  });
});

router.get('/users/list', adminEnsurer, (req, res, next) => {
  loginUser(req.user, (result) => {
    User.findAll({
      }).then((users) => {
      res.render('admin/userlist', {
        configVars: configVars,
        loginUser: result,
        users: users
      });
    });
  });
});

router.get('/users/update/:userId', adminEnsurer, (req, res, next) => {
  User.findOne({
    where: {
      userId: req.params.userId
    }
  }).then((user) => {
    res.render('admin/userupdate', {
      configVars: configVars,
      loginUser: user,
      user: user
    });
  });
});

router.get('/spaces/list', adminEnsurer, (req, res, next) => {
  loginUser(req.user, (result) => {
    Space.findAll({
        order: [['"updatedAt"', 'DESC']]
      }).then((spaces) => {
      res.render('admin/spacelist', {
        configVars: configVars,
        loginUser: result,
        spaces: spaces
      });
    });
  });
});

router.get('/spaces/create', adminEnsurer, (req, res, next) => {
  loginUser(req.user, (result) => {
    res.render('admin/spacecreate', {
      configVars: configVars,
      loginUser: result
    });
  });
});

router.post('/spaces/create', adminEnsurer, (req, res, next) => {
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
  });
});

router.get('/spaces/update/:spaceId', adminEnsurer, (req, res, next) => {
  loginUser(req.user, (result) => {
    Space.findOne({
      where: {
        spaceId: req.params.spaceId
      }
    }).then((space) => {
      res.render('admin/spaceupdate', {
        configVars: configVars,
        loginUser: result,
        space: space
      });
    });
  });
});

router.post('/spaces/update/:spaceId', adminEnsurer, (req, res, next) => {
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

router.get('/spaces/delete/:spaceId', adminEnsurer, (req, res, next) => {
  Space.destroy({
    where: {
      spaceId: req.params.spaceId,
    }
  }).then((space) => {
    res.redirect('/admin/spaces/list');
  });
});

router.get('/userspace/create', adminEnsurer, (req, res, next) => {
  res.render('admin/userspacecreate', {
    configVars: configVars,
    loginUser: req.user
  });
});

router.post('/userspace/create', adminEnsurer, (req, res, next) => {
  UserSpace.create({
    userId: req.body.userId,
    spaceId: req.body.spaceId
  }).then((space) => {
    res.redirect('/admin');
  });
});

module.exports = router;
