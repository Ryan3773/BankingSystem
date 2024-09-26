var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log("employeemodify.js: GET");
  res.render('employeemodify', { });
});

router.post('/', function(req, res, next) {
    console.log("employeemodify.js: POST");
    res.render('customerportal', { });
});

module.exports = router;
