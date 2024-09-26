var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log("adminlogin.js: GET");
  res.render('adminlogin', { });
});

router.post('/', function(req, res, next) {
    console.log("adminlogin.js: POST");
    res.render('adminmodify', { });
});

module.exports = router;
