'use strict';
var express = require('express');
var router = express.Router();
var moment = require('moment-timezone-jp');
var Space = require('../models/space');
var User = require('../models/user');
var Availability = require('../models/availability');

/* GET home page. */
router.get('/', function(req, res, next) {
  const title = 'ツモリンク';
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
        let today = new Date();
        today.setTime(today.getTime() + 1000*60*60*9);
        const todayObj = {
          year: today.getFullYear(),
          month: today.getMonth(),
          date: today.getDate()
        }
        spaces.forEach((s) => {
          const spaceId = s.spaceId;
          const availabilityArray = [];
          availabilities.forEach((a) => {
            if(spaceId === a.spaceId) {
              let arrivingAt = a.arrivingAt;
              arrivingAt.setTime(arrivingAt.getTime() + 1000*60*60*9);
              const arrivingAtObj = {
                year: arrivingAt.getFullYear(),
                month: arrivingAt.getMonth(),
                date: arrivingAt.getDate()
              }
              if(todayObj.year === arrivingAtObj.year && todayObj.month === arrivingAtObj.month && todayObj.date === arrivingAtObj.date) {
                const momentArrivingAt = moment(a.arrivingAt);
                const availabilityObj = {
                  userId: a.userId,
                  username: a.user.username,
                  photoUrl: a.user.photoUrl,
                  arrivingAt: momentArrivingAt.fromNow()
                }
                availabilityArray.push(availabilityObj);
              }
            }
          });
          s['availabilities'] = availabilityArray;
        });
        const hours = [0, 1, 2, 3, 4, 5, 6];
        const minutes = ['00', '10', '20', '30', '40', '50'];
        res.render('index', {
          title: title,
          loginUser: req.user,
          spaces: spaces,
          hours : hours,
          minutes: minutes
        });
      });
    });
  } else {
    res.render('index', { title: title, loginUser: req.user });
  }
});

module.exports = router;
