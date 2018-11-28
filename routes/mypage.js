'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const loginUser = require('./login-user');
const configVars = require('./config-vars');
const User = require('../models/user');
const Availability = require('../models/availability');
const multer = require('multer');

const thumbnailPath = '/images/users/thumbnail/';
const dest = './public' + thumbnailPath;
const uploader = multer({ dest: dest }).single('thumbnail');

router.get('/', authenticationEnsurer, (req, res, next) => {
  const title = 'マイページ | ツモリンク';
  loginUser(req.user, (result) => {
    Availability.findAll({
      where: {
        userId: result.userId
      },
      order: [['"createdAt"', 'ASC']]
    }).then((availabilities) => {
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
