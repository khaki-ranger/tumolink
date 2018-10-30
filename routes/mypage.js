'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const User = require('../models/user');

router.get('/', authenticationEnsurer, (req, res, next) => {
  const title = 'マイページ | ツモリンク';
  User.findOne({
    where: {
      userId: req.user.id
    }
  }).then((user) => {
    res.render('mypage', {
      loginUser: req.user,
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
      loginUser: req.user,
      user: user
    });
  });
});

router.post('/edit/:userId', authenticationEnsurer, (req, res, next) => {
  const param = {
    nickname: req.body.nickname
  };
  const filter = {
    where: {
      userId: req.params.userId,
    }
  }
  User.update(param, filter)
  .then(() => {
    res.redirect('/home');
  });
});

module.exports = router;
