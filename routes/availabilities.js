'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const uuid = require('node-uuid');
const Availability = require('../models/availability');
const Space = require('../models/space');
const Slack = require('node-slackr');

function postSlack(args) {
  Space.findOne({
    where: {
      spaceId: args.spaceId
    }
  }).then((space) => {
    if (space.slackWebhookURL) {
      const webhookURL = space.slackWebhookURL;
      const slack = new Slack(webhookURL);
      const prefix = args.direction === 'arriving' || args.leavingAtPrev ? 'やっぱり': '';
      const time = args.direction === 'leaving' ? args.leavingAt : args.arrivingAt;
      const minutes = ('0' + time.getMinutes()).slice(-2); 
      const direction = args.direction === 'leaving' ? 'から帰る' : 'に行く';
      const message = args.username + '「' + prefix + time.getHours() + ':' + minutes + '頃に、' + space.spaceName + direction + 'ツモリンク！」';
      const slackMessage = {
        text: message,
        channel: space.slackChannel,
        username: args.username,
        icon_url: args.profileImg
      };
      slack.notify(slackMessage, function(error, result){
        if (error) {
          console.log(error);
        } else {
          console.log(result);
        }
      });
    }
  });
}

function setTime(args) {
  const addHour = Number(args.hour);
  const addMinute = Number(args.minute);
  const addTotalMinute = addMinute + addHour * 60;
  let resultAt  = new Date();
  resultAt.setTime(resultAt.getTime() + 1000*60*60*9);
  resultAt.setMinutes(resultAt.getMinutes() + addTotalMinute);
  return resultAt;
}

router.post('/', authenticationEnsurer, (req, res, next) => {
  const action = req.body.action;
  const direction = req.body.direction;
  if (action !== 'del' && direction) {
    const filter = {
      where: {
        visibility: true,
        spaceId: req.body.spaceId,
        userId: req.user.id
      }
    };
    Availability.findOne(filter).then((availability) => {
      const availabilityId = availability.availabilityId;
      const dateObj = {
        arrivingAt: availability.arrivingAt,
        leavingAt: availability.leavingAt
      };
      const leavingAtPrev = dateObj.leavingAt;
      const param = {
        visibility: false
      };
      const filter = {
        where: {
          availabilityId: availabilityId 
        }
      };
      Availability.update(param, filter).then(() => {
        const args = {
          hour: req.body.hour,
          minute: req.body.minute,
        };
        if (direction === 'arriving') {
          dateObj.arrivingAt = setTime(args);
        } else {
          dateObj.leavingAt = setTime(args);
        }
        const arrivingAt = setTime(args);
        Availability.create({
          spaceId: req.body.spaceId,
          userId: req.user.id,
          arrivingAt: dateObj.arrivingAt,
          leavingAt: dateObj.leavingAt,
          visibility: true
        }).then(() => {
          const params = {
            spaceId: req.body.spaceId,
            username: req.user.displayName,
            profileImg: req.user.photos[0].value,
            direction: direction,
            arrivingAt: dateObj.arrivingAt,
            leavingAt: dateObj.leavingAt,
            leavingAtPrev : leavingAtPrev
          };
          res.redirect('/home');
          postSlack(params);
        });
      });
    });
  } else {
    const param = {
      visibility: false
    };
    const filter = {
      where: {
        spaceId: req.body.spaceId,
        userId: req.user.id
      }
    };
    Availability.update(param, filter).then(() => {
      if (action !== 'del') { 
        const args = {
          hour: req.body.hour,
          minute: req.body.minute,
        };
        const arrivingAt = setTime(args);
        Availability.create({
          spaceId: req.body.spaceId,
          userId: req.user.id,
          arrivingAt: arrivingAt,
          visibility: true
        }).then((availability) => {
          const params = {
            spaceId: req.body.spaceId,
            username: req.user.displayName,
            profileImg: req.user.photos[0].value,
            direction: direction,
            arrivingAt: arrivingAt,
            leavingAt: undefined,
            availabilityUserFlag: req.body.availabilityUserFlag
          };
          res.redirect('/home');
          postSlack(params);
        });
      } else {
        res.redirect('/home');
      }
    });
  }
});

module.exports = router;
