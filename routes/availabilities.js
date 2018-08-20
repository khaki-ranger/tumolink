'use strict';
const express = require('express');
const router = express.Router();

router.post('/', (req, res, next) => {
  const updatedAt = new Date();
  const args = {
    spaceId: req.body.spaceId,
    userId: req.user.id,
    updatedAt: updatedAt
  };
  console.log(args);
  res.json({ status: 'OK' });
});

module.exports = router;
