'use strict';
var express = require('express');
var router = express.Router();
var Space = require('../models/space');
var User = require('../models/user');
var Availability = require('../models/availability');

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.user) {
    Space.findAll({
      order: [['"updatedAt"', 'DESC']]
    }).then((spaces) => {
      Availability.findAll({
        include: [
          {
            model: User,
            attributes: ['userId', 'username', 'photoUrl']
          }
        ],
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
        spaces.forEach((s) => {
          const spaceId = s.spaceId;
          const availabilityArray = [];
          let availabilityUserFlag = false;
          let rightNowFlag = false;
          let beforeLine = '';
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
                let arrivingAtText = '';
                arrivingAtText = arrivingAtObj.hours + ' 時 ' + arrivingAtObj.minutes + ' 分頃';
                let diffMinutes = arrivingAtObj.minutes - nowObj.minutes;
                const diffHours = arrivingAtObj.hours - nowObj.hours;
                diffMinutes += diffHours * 60;
                if (diffMinutes > 0) {
                  rightNow = true;
                }
                if (rightNow !== rightNowFlag) {
                  beforeLine = 'beforeLine';
                  rightNowFlag = true;
                } else {
                  beforeLine = '';
                }
                const availabilityObj = {
                  userId: a.userId,
                  username: a.user.username,
                  photoUrl: a.user.photoUrl,
                  arrivingAt: arrivingAtText,
                  beforeLine: beforeLine
                }
                availabilityArray.push(availabilityObj);
                if (req.user.id === availabilityObj.userId) {
                  availabilityUserFlag = true;
                }
              }
            }
          });
          s['availabilities'] = availabilityArray;
          s['availabilityUserFlag'] = availabilityUserFlag; 
        });
        const hours = [0, 1, 2, 3, 4, 5, 6];
        const minutes = ['00', '10', '20', '30', '40', '50'];
        res.render('home', {
          loginUser: req.user,
          spaces: spaces,
          hours : hours,
          minutes: minutes
        });
      });
    });
  } else {
    res.redirect('/');
  }
});

module.exports = router;
