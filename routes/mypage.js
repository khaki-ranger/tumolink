'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const loginUser = require('./login-user');
const configVars = require('./config-vars');
const Space = require('../models/space');
const User = require('../models/user');
const Availability = require('../models/availability');
const multer = require('multer');
const moment = require('moment');
const momentTimezone = require('moment-timezone');

const thumbnailPath = '/images/users/thumbnail/';
const dest = './public' + thumbnailPath;
const uploader = multer({ dest: dest }).single('thumbnail');

router.get('/', authenticationEnsurer, (req, res, next) => {
  const title = 'マイページ | ツモリンク';
  loginUser(req.user, (result) => {
    Availability.findAll({
      include: [
        {
          model: Space,
          attributes: ['spaceId', 'spaceName']
        }
      ],
      where: {
        userId: result.userId
      },
      order: [['"createdAt"', 'DESC']]
    }).then((availabilities) => {
      const tz = 'Asia/Tokyo';
      const format = 'YYYY/MM/DD HH:mm';
      const separator = /\s+/;
      availabilities.forEach((availability) => {
        if (availability.space) {
          const formattedCreatedAtStr = momentTimezone(availability.createdAt).tz(tz).format(format);
          availability.formattedCreatedAtArray = formattedCreatedAtStr.split(separator);
          if (availability.arrivingAt) {
            const formattedArrivingAtStr = moment(availability.arrivingAt).format(format);
            availability.formattedArrivingAtArray = formattedArrivingAtStr.split(separator);
          }
          if (availability.leavingAt) {
            const formattedLeavingAtStr = moment(availability.leavingAt).format(format);
            availability.formattedLeavingAtArray = formattedLeavingAtStr.split(separator);
          }
        }
      });
      res.render('mypage/mypage', {
        title: title,
        configVars: configVars,
        loginUser: result,
        availabilities: availabilities
      });
    });
  });
});

router.get('/edit', authenticationEnsurer, (req, res, next) => {
  const title = 'ユーザー情報編集 | ツモリンク';
  loginUser(req.user, (result) => {
    res.render('mypage/edit', {
      title: title,
      configVars: configVars,
      loginUser: result
    });
  });
});

router.post('/edit/:userId', authenticationEnsurer, (req, res, next) => {
  uploader(req, res, (error) => {
    if(error) {
      console.log('Failed to write ' + req.file.destination + ' with ' + error);
    } else {
      const param = {
        nickname: req.body.nickname,
      };
      if (req.file) {
        param.thumbnailPath = thumbnailPath + req.file.filename
      }
      const filter = {
        where: {
          userId: req.params.userId,
        }
      }
      User.update(param, filter)
      .then(() => {
        res.redirect('/home');
      });
    }
  }); 
});

module.exports = router;
