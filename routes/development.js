'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const loginUser = require('./login-user');
const configVars = require('./config-vars');
const Space = require('../models/space');
const User = require('../models/user');
const Availability = require('../models/availability');
const UserSpace = require('../models/userspace');

router.get('/', authenticationEnsurer, function(req, res, next) {
  const title = 'ホーム | ツモリンク';
  const hours = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
  const minutes = ['00', '10', '20', '30', '40', '50'];
  loginUser(req.user, (result) => {
    res.render('development', {
      title: title,
      loginUser: result,
      configVars: configVars,
      hours : hours,
      minutes: minutes
    });
  });
});

router.get('/availabilities', authenticationEnsurer, function(req, res, next) {
  UserSpace.findAll({
    include: [
      {
        model: Space,
        attributes: ['spaceId', 'spaceName', 'imgPath', 'livelynkUrl']
      }
    ],
    where: {
      userId: req.user.id
    },
    order: [['"updatedAt"', 'ASC']]
  }).then((userspaces) => {
    Availability.findAll({
      include: [
        {
          model: User,
          attributes: ['userId', 'username', 'nickname', 'photoUrl', 'thumbnailPath']
        }
      ],
      where: {
        visibility: true
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
      userspaces.forEach((s) => {
        const spaceId = s.spaceId;
        const availabilityArray = [];
        let availabilityUserFlag = false;
        let rightNowFlag = false;
        let branchPoint = '';
        availabilities.forEach((a) => {
          if(spaceId === a.spaceId) {
            let arrivingAt = a.arrivingAt;
            const arrivingAtObj = {
              year: arrivingAt.getFullYear(),
              month: arrivingAt.getMonth(),
              date: arrivingAt.getDate(),
              hours: arrivingAt.getHours(),
              minutes: arrivingAt.getMinutes()
            }
            if(nowObj.year === arrivingAtObj.year && nowObj.month === arrivingAtObj.month && nowObj.date === arrivingAtObj.date) {
              let rightNow = false;
              let userStatus = undefined;
              const arrivingAtMinutes = ('0' + arrivingAtObj.minutes).slice(-2); 
              const arrivingAtText = arrivingAtObj.hours + ':' + arrivingAtMinutes + ' -';
              let diffMinutes = arrivingAtObj.minutes - nowObj.minutes;
              const diffHours = arrivingAtObj.hours - nowObj.hours;
              diffMinutes += diffHours * 60;
              if (diffMinutes > 0) {
                rightNow = true;
              } else {
                userStatus = '未確認';
              }
              if (rightNow !== rightNowFlag) {
                branchPoint = 'afterBegin';
                rightNowFlag = true;
              } else {
                branchPoint = '';
              }
              const leavingAt = a.leavingAt;
              let leavingAtText = undefined;
              if (leavingAt) {
                const leavingAtObj = {
                  hours: leavingAt.getHours(),
                  minutes: leavingAt.getMinutes()
                }
                const leavingAtMinutes = ('0' + leavingAtObj.minutes).slice(-2); 
                leavingAtText = leavingAtObj.hours + ':' + leavingAtMinutes;
              }
              const availabilityObj = {
                userId: a.userId,
                username: a.user.username,
                nickname: a.user.nickname,
                photoUrl: a.user.photoUrl,
                thumbnailPath: a.user.thumbnailPath,
                arrivingAt: arrivingAtText,
                leavingAt: leavingAtText,
                updatedAt: a.updatedAt,
                userStatus: userStatus,
                branchPoint: branchPoint
              }
              availabilityArray.push(availabilityObj);
              if (req.user.id === availabilityObj.userId) {
                availabilityUserFlag = true;
              }
            }
          }
        });
        if (availabilityArray.length > 0 && rightNowFlag === false) {
          availabilityArray[availabilityArray.length - 1].branchPoint = 'beforeEnd';
        }
        s.dataValues.availabilities = availabilityArray;
        s.dataValues.availabilityUserFlag = availabilityUserFlag; 
      });
      res.json(userspaces);
    });
  });
});

module.exports = router;
