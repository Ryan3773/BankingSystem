var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log("customeracct.js: GET");
  res.render('customeracct', { });
});

module.exports = router;
