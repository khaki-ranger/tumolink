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
      const webhookURL = 'https://hooks.slack.com/services/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';
      const slack = new Slack(webhookURL);
      let message = '';
      if (addHour > 0) {
        message += addHour + '時間'; 
      }
      if (addMinute > 0) {
        message += addMinute + '分'; 
      }
      if (addHour > 0 || addMinute > 0) {
        message += '後に、'; 
      }
      const slackMessage = {
        text: message += space.spaceName + 'に行くツモリンク！',
        channel: "#test-tumolink",
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
