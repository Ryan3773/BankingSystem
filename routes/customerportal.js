var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log("customerportal.js: GET");
  res.render('customerportal', { });
});

module.exports = router;
