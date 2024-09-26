var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log("customertransfer.js: GET");
  res.render('customertransfer', { });
});

module.exports = router;
