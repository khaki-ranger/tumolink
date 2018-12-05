'use strict';
const express = require('express');
const router = express.Router();
const configVars = require('./config-vars');
const User = require('../models/user');
const Availability = require('../models/availability');

router.post('/googleHome', function(req, res, next) {
  const spaceId = req.body.spaceId;
  const availabilityArray = [];
  Availability.findAll({
    include: [
      {
        model: User,
        attributes: ['userId', 'username', 'nickname']
      }
    ],
    where: {
      spaceId: spaceId,
      visibility: true,
      postedGoogleHome: false
    },
    order: [['"arrivingAt"', 'ASC']]
  }).then((availabilities) => {
    let now = new Date();
    now.setTime(now.getTime() + 1000*60*60*9);
    const nowObj = {
      year: now.getFullYear(),
      month: now.getMonth(),
      date: now.getDate(),
      hours: now.getHours(),
      minutes: now.getMinutes()
    }
    availabilities.forEach((a) => {
      const arrivingAt = a.arrivingAt;
      if (arrivingAt) {
        const arrivingAtObj = {
          year: arrivingAt.getFullYear(),
          month: arrivingAt.getMonth(),
          date: arrivingAt.getDate(),
          hours: arrivingAt.getHours(),
          minutes: arrivingAt.getMinutes()
        }
        if(nowObj.year === arrivingAtObj.year && nowObj.month === arrivingAtObj.month && nowObj.date === arrivingAtObj.date) {
          const name = a.user.nickname ? a.user.nickname : a.user.username;
          const time = arrivingAtObj.hours + '時' + arrivingAtObj.minutes + '分頃に、';
          const availatilityLine = name + 'さんが、' + time;
          availabilityArray.push(availatilityLine);
        }
      }
    });
    const responseObj = {
      newArrival: false,
      text: undefined
    }
    if (availabilityArray.length > 0) {
      responseObj.newArrival = true;
      responseObj.text = 'ツモリンクです！';
      responseObj.text += availabilityArray.join('そして、')
      responseObj.text += '来るつもりみたいですよ。';
      const param = {
        postedGoogleHome: true
      };
      const filter = {
        where: {
          postedGoogleHome: false,
          spaceId: spaceId
        }
      };
      Availability.update(param, filter).then(() => {
        console.log('posted message: ' + responseObj.text);
        console.log('availability was updated.');
      });
    }
    res.json(responseObj);
  });
});

module.exports = router;
