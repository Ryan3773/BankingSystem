var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log("employeetransfer.js: GET");
  res.render('employeetransfer', { });
});

module.exports = router;
