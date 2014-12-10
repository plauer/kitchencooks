var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
// need to npm install --save passport and passport-github
var passport = require('passport');
var GitHubStrategy = require('passport-github').Strategy;
var flash = require('connect-flash');


// get a github api client_id and client_secret
// can find them here: https://github.com/organizations/Kitchencooks/settings/applications/150833
var GITHUB_CLIENT_ID = "9fc53664e3f5cda07061";
var GITHUB_CLIENT_SECRET = "a6549bd7252dc4405d50f908a7c170f53ddaf0fa";

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

app.get('/', function(req, res){
  res.render('index', { user: req.user });
});

app.use(passport.initialize());

// GitHub config, this callback should match callback in api
passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      return done(null, profile);
    });
  }
));

// serialize and deserialize the user
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

var session = require('express-session');
app.use(session({
  secret: 'secret HRR Kitchen k00ks App',
  resave: false,
  saveUninitialized: true
}));
app.use(flash());

app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

app.get('/login', function(req, res){
  res.render('login', { user: req.user });
});

app.get('/auth/github',
  passport.authenticate('github'),
  function(req, res){
    // The request will be redirected to GitHub for authentication,
    // so this function will not be called.
  });

app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/' }),
  function(req, res) {
    console.log('req.user: ', req.user);
    //res.render('index', { user: req.user });
    res.redirect('/');
  });

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var server = app.listen('3000');
module.exports = app;

//sockets
var socket = require("socket.io");
var io = socket.listen(server)

//set up socket connection
io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});




