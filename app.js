var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
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

app.use('/', indexRouter);
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
