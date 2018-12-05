'use strict';
const express = require('express');
const router = express.Router();
const configVars = require('./config-vars');
const User = require('../models/user');
const Googlehome = require('../models/googlehome');

router.post('/googleHome', function(req, res, next) {
  const spaceId = req.body.spaceId;
  const availabilityArray = [];
  Googlehome.findAll({
    include: [
      {
        model: User,
        attributes: ['userId', 'username', 'nickname']
      }
    ],
    where: {
      spaceId: spaceId,
      posted: false
    },
    order: [['"createdAt"', 'ASC']]
  }).then((availabilities) => {
    availabilities.forEach((a) => {
      const name = a.user.nickname ? a.user.nickname : a.user.username;
      const availatilityLine = name + 'さんが、' + a.text;
      availabilityArray.push(availatilityLine);
    });
    const responseObj = {
      newArrival: false,
      text: undefined
    }
    if (availabilityArray.length > 0) {
      responseObj.newArrival = true;
      responseObj.text = 'ツモリンクです！';
      responseObj.text += availabilityArray.join('、そして、')
      responseObj.text += 'みたいですよ。';
      const param = {
        posted: true
      };
      const filter = {
        where: {
          posted: false,
          spaceId: spaceId
        }
      };
      Googlehome.update(param, filter).then(() => {
        console.log('posted message: ' + responseObj.text);
        console.log('googlehome was updated.');
      });
    }
    res.json(responseObj);
  });
});

module.exports = router;
