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
  let createdAt = new Date();
  let updatedAt = new Date();
  createdAt..setTime(createdAt.getTime() + 1000*60*60*9);
  updatedAt..setTime(updatedAt.getTime() + 1000*60*60*9);
  Availability.create({
    availabilityId: availabilityId,
    spaceId: req.body.spaceId,
    userId: req.user.id,
    createdAt: createdAt,
    updatedAt: updatedAt
  }).then((availability) => {
    const args = {
      username: req.user.displayName,
      profileImg: req.user.photos[0].value
    };
    res.json(args);
    // Slack 通知
    Space.findOne({
      where: {
        spaceId: req.body.spaceId
      }
    }).then((space) => {
      const webhookURL = 'https://hooks.slack.com/services/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';
      const slack = new Slack(webhookURL);
      const slackMessage = {
        text: space.spaceName + 'に行くツモリンク！',
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
      });
    });
  });
});

module.exports = router;
