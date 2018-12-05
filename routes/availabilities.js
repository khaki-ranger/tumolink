'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const uuid = require('node-uuid');
const Availability = require('../models/availability');
const User = require('../models/user');
const Space = require('../models/space');
const Googlehome = require('../models/googlehome');
const Slack = require('node-slackr');

function postGoogleHome(args) {
  let text = '';
  if (args.action === 'del') {
    text = '気が変わったから、行くのやめる';
  } else {
    const prefix = args.direction === 'arriving' || args.leavingAtPrev ? 'やっぱり': '';
    const time = args.direction === 'leaving' ? args.leavingAt : args.arrivingAt;
    const minutes = time.getMinutes(); 
    const direction = args.direction === 'leaving' ? '帰る' : '来る';
    text = prefix + time.getHours() + '時' + minutes + '分頃に、' + direction + 'つもり';
  }
  Googlehome.create({
    spaceId: args.spaceId,
    userId: args.userId,
    text: text,
    posted: false
  }).then((user) => {
    console.log('Posted to Googlehome');
  });
}

function postSlack(args) {
  User.findOne({
    where: {
      userId: args.userId
    }
  }).then((user) => {
    const username = user.nickname ? user.nickname : user.username;
    Space.findOne({
      where: {
        spaceId: args.spaceId
      }
    }).then((space) => {
      if (space.slackWebhookURL) {
        const webhookURL = space.slackWebhookURL;
        const slack = new Slack(webhookURL);
        let message = '';
        if (args.action === 'del') {
          message = username + '「やっぱり' + space.spaceName  + 'に行くのをやめる」';
        } else {
          const prefix = args.direction === 'arriving' || args.leavingAtPrev ? 'やっぱり': '';
          const time = args.direction === 'leaving' ? args.leavingAt : args.arrivingAt;
          const minutes = ('0' + time.getMinutes()).slice(-2); 
          const direction = args.direction === 'leaving' ? 'から帰る' : 'に行く';
          message = username + '「' + prefix + time.getHours() + ':' + minutes + '頃に、' + space.spaceName + direction + 'ツモリンク！」';
        }
        const slackMessage = {
          text: message,
          channel: space.slackChannel,
          username: 'ツモリンク',
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
            userId: req.user.id,
            profileImg: req.user.photos[0].value,
            action: action,
            direction: direction,
            arrivingAt: dateObj.arrivingAt,
            leavingAt: dateObj.leavingAt,
            leavingAtPrev : leavingAtPrev
          };
          res.redirect('/home');
          postSlack(params);
          postGoogleHome(params);
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
            userId: req.user.id,
            profileImg: req.user.photos[0].value,
            action: action,
            direction: direction,
            arrivingAt: arrivingAt,
            leavingAt: undefined
          };
          res.redirect('/home');
          postSlack(params);
          postGoogleHome(params);
        });
      } else {
        const params = {
          spaceId: req.body.spaceId,
          userId: req.user.id,
          profileImg: req.user.photos[0].value,
          action: action,
          direction: direction,
          arrivingAt: undefined,
          leavingAt: undefined
        };
        res.redirect('/home');
        postSlack(params);
        postGoogleHome(params);
      }
    });
  }
});

module.exports = router;
