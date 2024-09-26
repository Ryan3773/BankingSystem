var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log("customerlogin.js: GET");
  res.render('customerlogin', { });
});

router.post('/', function(req, res, next) {
    console.log("customerlogin.js: POST");
    res.render('customerportal', { });
});

module.exports = router;
