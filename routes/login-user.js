'use strict';
const User = require('../models/user');

const loginUser = function(requestUser, callback) {
  if (requestUser) {
    User.findOne({
      where: {
        userId: requestUser.id
      }
    }).then((user) => {
      callback(user);
    });
  } else {
    callback(undefined);
  }
}

module.exports = loginUser;
