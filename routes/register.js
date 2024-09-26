var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log("register.js: GET");
  res.render('register', { });
});

router.post('/', function(req, res, next) {
    console.log("register.js: POST");
    res.render('customerportal', { });
});

module.exports = router;
