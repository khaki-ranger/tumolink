'use strict';
let configVars = {
}
if (!process.env.HEROKU_URL) {
  const settings = require('../settings');
  configVars = settings;
} else {
  configVars = {
    admin: {
      id: process.env.ADMIN_ID,
      name: process.env.ADMIN_NAME
    },
    facebook: {
      app_id: process.env.FACEBOOK_APP_ID,
      app_name: process.env.FACEBOOK_APP_SECRET
    },
    google: {
      gs_id: process.env.GOOGLE_GA_ID
    },
    heroku: {
      url: process.env.HEROKU_URL
    },
    vuejs: {
      file: process.env.VUEJS_FILE
    }
  }
}

module.exports = configVars;
