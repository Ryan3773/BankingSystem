var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);

var indexRouter = require('./routes/index');
var logoutRouter = require('./routes/logout');
var usersRouter = require('./routes/users');
var registerRouter = require('./routes/register');
var adminLoginRouter = require('./routes/adminlogin');
var adminModifyRouter = require('./routes/adminmodify');
var customerAcctRouter = require('./routes/customeracct');
var customerLoginRouter = require('./routes/customerlogin');
var customerPortalRouter = require('./routes/customerportal');
var customerTransferRouter = require('./routes/customertransfer');
var employeeAcctRouter = require('./routes/employeeacct');
var employeeLoginRouter = require('./routes/employeelogin');
var employeePortalRouter = require('./routes/employeeportal');
var employeeTransferRouter = require('./routes/employeetransfer');
var employeeModifyRouter = require('./routes/employeemodify');
var modifyPortalRouter = require('./routes/modifyportal');
var modifyTransferRouter = require('./routes/modifytransfer');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, "node_modules/bootstrap/dist/")));
app.use(express.static(path.join(__dirname, "node_modules/bootstrap-icons/")));
app.use(express.static(path.join(__dirname, "node_modules/crypto-js/")));

//This will set up the database if it doesn't already exist
var dbCon = require('./lib/database');

// Session management to store cookies in a MySQL server (this has a bug, so we assist it by creating the database for it)
var dbSessionPool = require('./lib/sessionPool.js');
var sessionStore = new MySQLStore({}, dbSessionPool);

// Necessary middleware to store session cookies in MySQL
app.use(session({
    key: 'session_cookie_name',
    secret: 'session_cookie_secret1234',
    store: sessionStore,
    resave: true,
    saveUninitialized: true,
  cookie : {
    sameSite: 'strict'
  }
}));

// Middleware to make session variables available in .ejs template files
app.use(function(req, res, next) {
  res.locals.session = req.session;
  next();
});

app.use('/', indexRouter);
app.use('/logout', logoutRouter);
app.use('/users', usersRouter);
app.use('/register', registerRouter);
app.use('/adminlogin', adminLoginRouter);
app.use('/adminmodify', adminModifyRouter);
app.use('/customeracct', customerAcctRouter);
app.use('/customerlogin', customerLoginRouter);
app.use('/customerportal', customerPortalRouter);
app.use('/customertransfer', customerTransferRouter);
app.use('/employeeacct', employeeAcctRouter);
app.use('/employeelogin', employeeLoginRouter);
app.use('/employeeportal', employeePortalRouter);
app.use('/employeetransfer', employeeTransferRouter);
app.use('/employeemodify', employeeModifyRouter);
app.use('/modifyportal', modifyPortalRouter);
app.use('/modifytransfer', modifyTransferRouter);

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
