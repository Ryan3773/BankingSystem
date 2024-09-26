var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log("employeeportal.js: GET");
  res.render('employeeportal', { });
});

module.exports = router;
