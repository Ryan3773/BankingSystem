var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log("employeeacct.js: GET");
  res.render('employeeacct', { });
});

module.exports = router;
