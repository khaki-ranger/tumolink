'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const configVars = require('./config-vars');
const User = require('../models/user');
const multer = require('multer');

const thumbnailPath = '/images/users/thumbnail/';
const dest = './public' + thumbnailPath;
const uploader = multer({ dest: dest }).single('thumbnail');

router.get('/', authenticationEnsurer, (req, res, next) => {
  const title = 'マイページ | ツモリンク';
  User.findOne({
    where: {
      userId: req.user.id
    }
  }).then((user) => {
    res.render('mypage/mypage', {
      title: title,
      configVars: configVars,
      loginUser: user,
      user: user
    });
  });
});

router.get('/edit', authenticationEnsurer, (req, res, next) => {
  const title = 'ユーザー情報編集 | ツモリンク';
  User.findOne({
    where: {
      userId: req.user.id
    }
  }).then((user) => {
    res.render('mypage/edit', {
      title: title,
      configVars: configVars,
      loginUser: user,
      user: user
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
