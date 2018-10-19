'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const uuid = require('node-uuid');
const Availability = require('../models/availability');
const Space = require('../models/space');
const Slack = require('node-slackr');

router.post('/', authenticationEnsurer, (req, res, next) => {
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
      const addHour = Number(req.body.hour);
      const addMinute = Number(req.body.minute);
      const addTotalMinute = addMinute + addHour * 60;
      let arrivingAt  = new Date();
      arrivingAt.setTime(arrivingAt.getTime() + 1000*60*60*9);
      arrivingAt.setMinutes(arrivingAt.getMinutes() + addTotalMinute);
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
            const minutes = arrivingAt.getMinutes() === 0 ? '00' : arrivingAt.getMinutes(); 
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
});

module.exports = router;
