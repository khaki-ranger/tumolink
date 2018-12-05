var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var helmet = require('helmet');
var session = require('express-session');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;

var configVars = require('./routes/config-vars');
var User = require('./models/user');
var Space = require('./models/space');
var UserSpace = require('./models/userspace');
var Availability = require('./models/availability');
var Googlehome = require('./models/googlehome');
User.sync({
    force: false,
    alter:true
  }).then(() => {
    Space.sync({
      force: false,
      alter:true
    }).then(() => {
      UserSpace.belongsTo(User, {foreignKey: 'userId' });
      UserSpace.belongsTo(Space, {foreignKey: 'spaceId' });
      UserSpace.sync();
      Availability.belongsTo(User, {foreignKey: 'userId' });
      Availability.belongsTo(Space, {foreignKey: 'spaceId' });
      Availability.sync();
      Googlehome.belongsTo(User, {foreignKey: 'userId' });
      Googlehome.belongsTo(Space, {foreignKey: 'spaceId' });
      Googlehome.sync();
    });
});

var FACEBOOK_APP_ID = configVars.facebook.app_id;
var FACEBOOK_APP_SECRET = configVars.facebook.app_secret;
var TWITTER_CONSUMER_KEY = configVars.twitter.consumer_key;
var TWITTER_CONSUMER_SECRET = configVars.twitter.consumer_secret;

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

passport.use(new FacebookStrategy({
  clientID: FACEBOOK_APP_ID,
  clientSecret: FACEBOOK_APP_SECRET,
  callbackURL: process.env.HEROKU_URL ? process.env.HEROKU_URL + 'auth/facebook/callback' : 'http://localhost:8000/auth/facebook/callback',
  profileFields: ['id', 'displayName', 'photos', 'email']
},
  function (accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      User.upsert({
        userId: profile.id,
        username: profile.displayName,
        photoUrl: profile.photos[0].value
      }).then(() => {
        done(null, profile);
      });
    });
  }
));

passport.use(new TwitterStrategy({
  consumerKey: TWITTER_CONSUMER_KEY,
  consumerSecret: TWITTER_CONSUMER_SECRET,
  callbackURL: process.env.HEROKU_URL ? process.env.HEROKU_URL + 'auth/twitter/callback' : 'http://localhost:8000/auth/twitter/callback'
},
  function(token, tokenSecret, profile, done) {
    process.nextTick(function () {
      User.upsert({
        userId: profile.id,
        username: profile.displayName,
        photoUrl: profile.photos[0].value
      }).then(() => {
        done(null, profile);
      });
    });
  }
));

var indexRouter = require('./routes/index');
var developmentRouter = require('./routes/development');
var homeRouter = require('./routes/home');
var adminRouter = require('./routes/admin');
var logoutRouter = require('./routes/logout');
var spacesRouter = require('./routes/spaces');
var availabilitiesRouter = require('./routes/availabilities');
var privacyRouter = require('./routes/privacy');
var mypageRouter = require('./routes/mypage');
var apiRouter = require('./routes/api');

var app = express();
app.use(helmet());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: '6d1a111ab8df9525',
  resave: false,
  saveUninitialized: false, 
  cookie:{_expires : 86400000}
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);
app.use('/development', developmentRouter);
app.use('/home', homeRouter);
app.use('/admin', adminRouter);
app.use('/logout', logoutRouter);
app.use('/spaces', spacesRouter);
app.use('/availabilities', availabilitiesRouter);
app.use('/privacy', privacyRouter);
app.use('/mypage', mypageRouter);
app.use('/api', apiRouter);

app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/' }),
  function (req, res) {
    res.redirect('/home');
});

app.get('/auth/twitter', passport.authenticate('twitter'));

app.get('/auth/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: '/' }),
  function (req, res) {
    res.redirect('/home');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
