'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const uuid = require('node-uuid');
const Availability = require('../models/availability');
const Space = require('../models/space');
const Slack = require('node-slackr');

router.post('/', authenticationEnsurer, (req, res, next) => {
  const availabilityId = uuid.v4();
  let nowDate = new Date();
  nowDate.setTime(nowDate.getTime() + 1000*60*60*9);
  const addHour = Number(req.body.hour);
  const addMinute = Number(req.body.minute);
  const addTotalMinute = addMinute + addHour * 60;
  let arrivingAt  = new Date();
  arrivingAt.setTime(arrivingAt.getTime() + 1000*60*60*9);
  arrivingAt.setMinutes(arrivingAt.getMinutes() + addTotalMinute);
  Availability.create({
    availabilityId: availabilityId,
    spaceId: req.body.spaceId,
    userId: req.user.id,
    createdAt: nowDate,
    updatedAt: nowDate,
    arrivingAt: arrivingAt
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
      const webhookURL = space.slackWebhookURL;
      const slack = new Slack(webhookURL);
      let message = '';
      if (req.body.availabilityUserFlag) {
        message += 'やっぱり';
      }
      message += arrivingAt.getHours() + '時' + arrivingAt.getMinutes() + '分頃に、' + space.spaceName + 'に行くツモリンク！';
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
    });
  });
});

module.exports = router;
