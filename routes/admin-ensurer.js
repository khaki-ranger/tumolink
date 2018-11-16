'use strict';
const admin = {
  id: undefined,
  name: undefined
}
if (!process.env.ADMIN_ID && !process.env.ADMIN_NAME) {
  const settings = require('../settings');
  admin.id = settings.admin.id;
  admin.name = settings.admin.name;
} else {
  admin.id = process.env.ADMIN_ID;
  admin.name = process.env.ADMIN_NAME;
}

function ensure(req, res, next) {
  if (req.isAuthenticated()){
    if (req.user.id === admin.id && req.user.displayName === admin.name) {
       console.log(admin.name + ' is Admin user!');
       return next(); 
    } else {
      console.log(admin.name + ' is not Admin user!');
      res.redirect('/');
    }
  } else {
    res.redirect('/');
  }
}

module.exports = ensure;
