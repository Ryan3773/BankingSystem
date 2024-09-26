var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log("employeelogin.js: GET");
  res.render('employeelogin', { });
});

router.post('/', function(req, res, next) {
    console.log("employeelogin.js: POST");
    res.render('employeeportal', { });
});

module.exports = router;
