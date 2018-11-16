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
    console.log(admin.id + ' : ' + req.user.id);
    console.log(admin.name + ' : ' + req.user.displayName);
    if (req.user.id === admin.id && req.user.displayName === admin.name) {
       console.log(req.user.displayName + ' is Admin user!');
       return next(); 
    } else {
      console.log(req.user.displayName + ' is not Admin user!');
      res.redirect('/');
    }
  } else {
    res.redirect('/');
  }
}

module.exports = ensure;
