'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const uuid = require('node-uuid');
const Availability = require('../models/availability');
const Space = require('../models/space');
const Slack = require('node-slackr');

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
  const direction = req.body.direction;
  if (direction === 'leaving') { // 「帰るツモリ」の場合
    const args = {
      hour: req.body.hour,
      minute: req.body.minute,
    };
    const param = {
      leavingAt: setTime(args)
    };
    const filter = {
      where: {
        visibility: true,
        spaceId: req.body.spaceId,
        userId: req.user.id
      }
    };
    Availability.update(param, filter).then(() => {
      res.redirect('/home');
    });
  } else { // 「行くツモリ」の場合
    const action = req.body.action;
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
          const args = {
            spaceId: req.body.spaceId,
            username: req.user.displayName,
            profileImg: req.user.photos[0].value
          };
          // Slack 通知
          Space.findOne({
            where: {
              spaceId: req.body.spaceId
            }
          }).then((space) => {
            if (space.slackWebhookURL) {
              const webhookURL = space.slackWebhookURL;
              const slack = new Slack(webhookURL);
              let message = args.username + '「';
              if (req.body.availabilityUserFlag !== 'false') {
                message += 'やっぱり';
              }
              const minutes = ('0' + arrivingAt.getMinutes()).slice(-2); 
              message += arrivingAt.getHours() + ':' + minutes + '頃に、' + space.spaceName + 'に行くツモリンク！」';
              const slackMessage = {
                text: message,
                channel: space.slackChannel,
                username: args.username,
                icon_url: args.profileImg
              };
              slack.notify(slackMessage, function(err, result){
                if (err) {
                  console.log('error... ' + err);
                } else {
                  console.log('success! ' + result);
                }
                res.redirect('/home');
              });
            } else {
              res.redirect('/home');
            }
          });
        });
      } else {
        res.redirect('/home');
      }
    });
  }
});

module.exports = router;
