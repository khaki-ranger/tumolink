'use strict';
const express = require('express');
const router = express.Router();
const configVars = require('./config-vars');
const User = require('../models/user');
const Space = require('../models/space');
const UserSpace = require('../models/userspace');
const Availability = require('../models/availability');
const Googlehome = require('../models/googlehome');

router.post('/iosclient', (req, res, next) => {
  const userid = req.body.userid;
  UserSpace.findAll({
    include: [
      {
        model: Space,
        attributes: ['spaceName', 'imgPath']
      }
    ],
    where: {
      userId: userid
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
      const spaceArray = [];
      userspaces.forEach((s) => {
        const spaceId = s.spaceId;
        const availabilityArray = [];
        let rightNowFlag = false;
        let branchPoint = '';
        const space = {
          name: s.space.spaceName,
          imgPath: s.space.imgPath,
          availabilities: undefined
        }
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
            }
          }
        });
        if (availabilityArray.length > 0 && rightNowFlag === false) {
          availabilityArray[availabilityArray.length - 1].branchPoint = 'beforeEnd';
        }
        if (availabilityArray.length > 0) {
          space.availabilities = availabilityArray
        }
        spaceArray.push(space);
      });
      res.json(spaceArray);
    });
  });
});

router.get('/iosclient', (req, res, next) => {
  Space.findAll({
    order: [['"updatedAt"', 'ASC']]
  }).then((spaces) => {
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
      const spaceArray = [];
      spaces.forEach((s) => {
        const spaceId = s.spaceId;
        const availabilityArray = [];
        let rightNowFlag = false;
        let branchPoint = '';
        const space = {
          name: s.spaceName,
          imgPath: s.imgPath,
          availabilities: undefined
        }
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
            }
          }
        });
        if (availabilityArray.length > 0 && rightNowFlag === false) {
          availabilityArray[availabilityArray.length - 1].branchPoint = 'beforeEnd';
        }
        if (availabilityArray.length > 0) {
          space.availabilities = availabilityArray
        }
        spaceArray.push(space);
      });
      res.json(spaceArray);
    });
  });
});

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
      const availatilityLine = name + a.text;
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
