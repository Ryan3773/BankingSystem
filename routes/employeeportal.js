var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');
objForCustPortal = {}

function GetCheckingBalance(req, res, email)
{
  console.log(email);
  let sql = "CALL get_checking_balance('" + email + "')";
  dbCon.query(sql, function(err, results) {
    if (err) {
        throw err;
    }
    const checking_balance = results[0][0].checking_balance;
    console.log(checking_balance);
    objForCustPortal.checking_balance = checking_balance;
    GetSavingsBalance(req, res, email);
  });
}

function GetSavingsBalance(req, res, email)
{
  let sql = "CALL get_savings_balance('" + email + "')";
  dbCon.query(sql, function(err, results) {
    if (err) {
        throw err;
    }
    const savings_balance = results[0][0].savings_balance;
    console.log(savings_balance);
    objForCustPortal.savings_balance = savings_balance;
    RenderIt(req, res);
  });
}

function RenderIt(req, res)
{
  res.render('employeeportal', objForCustPortal);
}

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log("employeeportal.js: GET");
  const email = req.session.email;
  objForCustPortal.email = email;
  GetCheckingBalance(req, res, email);
});

module.exports = router;
