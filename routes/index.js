'use strict';
var express = require('express');
var router = express.Router();
var moment = require('moment');
var Space = require('../models/space');
var User = require('../models/user');
var Availability = require('../models/availability');

/* GET home page. */
router.get('/', function(req, res, next) {
  const title = 'ツモリンク';
  if (req.user) {
    Space.findAll({
      where: {
        createdBy: req.user.id
      },
      order: [['"updatedAt"', 'DESC']]
    }).then((spaces) => {
      Availability.findAll({
        include: [
          {
            model: User,
            attributes: ['userId', 'username', 'photoUrl']
          }
        ]
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
              const updatedAt = a.updatedAt;
              const updatedAtObj = {
                year: updatedAt.getFullYear(),
                month: updatedAt.getMonth(),
                date: updatedAt.getDate()
              }
              if(todayObj.year === updatedAtObj.year && todayObj.month === updatedAtObj.month && todayObj.date === updatedAtObj.date) {
                let arrivingAt = moment(a.arrivingAt);
                moment.locale('ja');
                const availabilityObj = {
                  userId: a.userId,
                  username: a.user.username,
                  photoUrl: a.user.photoUrl,
                  arrivingAt: arrivingAt.toNow()
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
