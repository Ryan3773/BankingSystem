var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log("adminmodify.js: GET");
  res.render('adminmodify', { });
});

module.exports = router;
