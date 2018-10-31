'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const Space = require('../models/space');
const UserSpace = require('../models/userspace');

router.get('/', authenticationEnsurer, (req, res, next) => {
  const title = 'マイスペースを追加 | ツモリンク';
  Space.findAll({
      order: [['"updatedAt"', 'ASC']]
  }).then((spaces) => {
    UserSpace.findAll({
      where: {
        userId: req.user.id
      }
    }).then((userspaces) => {
      let userSpaceArray = [];
      userspaces.forEach((u) => {
        userSpaceArray.push(u.spaceId);
      });
      let spaceArray = [];
      spaces.forEach((s) => {
        const spaceId = s.spaceId;
        let registration = false;
        if (userSpaceArray.indexOf(spaceId) >= 0) {
          registration = !registration;
        }
        const obj = {
          spaceId: spaceId,
          spaceName: s.spaceName,
          imgPath: s.imgPath,
          registration: registration
        };
        spaceArray.push(obj);
      });
      res.render('spaces', {
        title: title,
        loginUser: req.user,
        spaces: spaceArray
      });
    });
  });
});

router.get('/list', (req, res, next) => {
  Space.findAll({
      order: [['"updatedAt"', 'ASC']]
  }).then((spaces) => {
    res.json(spaces);
  });
});

router.post('/userspace/update', authenticationEnsurer, (req, res, next) => {
  const add = req.body.registered === 'false' ? true : false;
  if (add) {
    UserSpace.create({
      userId: req.user.id,
      spaceId: req.body.spaceId
    }).then(() => {
      const resFunc = function() {
        res.json({action: 'add'})
      };
      setTimeout(resFunc, 1000);
    });
  } else {
    UserSpace.destroy({
      where: {
        userId: req.user.id,
        spaceId: req.body.spaceId
      }
    }).then(() => {
      const resFunc = function() {
        res.json({action: 'remove'})
      };
      setTimeout(resFunc, 1000);
    });
  }
});

module.exports = router;
