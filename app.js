var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var helmet = require('helmet');
var session = require('express-session');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

var User = require('./models/user');
var Space = require('./models/space');
var UserSpace = require('./models/userspace');
var Availability = require('./models/availability');
User.sync().then(() => {
  Space.sync({
    force: false,
    alter:true
  }).then(() => {
    UserSpace.belongsTo(User, {foreignKey: 'userId' });
    UserSpace.belongsTo(Space, {foreignKey: 'spaceId' });
    UserSpace.sync();
    Availability.belongsTo(User, {foreignKey: 'userId' });
    Availability.sync();
  });
});

var FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID || '283457335747265';
var FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || 'b5fed3e32295230e9f35a17d7b6d8d8e'

passport.serializeUser(function (user, done) {
  done(null, user.id);
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

var indexRouter = require('./routes/index');
var homeRouter = require('./routes/home');
var adminRouter = require('./routes/admin');
var logoutRouter = require('./routes/logout');
var spacesRouter = require('./routes/spaces');
var availabilitiesRouter = require('./routes/availabilities');
var privacyRouter = require('./routes/privacy');

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

app.use(session({ secret: '6d1a111ab8df9525', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);
app.use('/home', homeRouter);
app.use('/admin', adminRouter);
app.use('/logout', logoutRouter);
app.use('/spaces', spacesRouter);
app.use('/availabilities', availabilitiesRouter);
app.use('/privacy', privacyRouter);

app.get('/auth/facebook',
  passport.authenticate('facebook'),
  function (req, res) {
});

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/' }),
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
