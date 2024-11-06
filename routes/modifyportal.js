var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');
objForModifyPortal = {}

function GetCheckingBalance(req, res, email)
{
  let sql = "CALL get_checking_balance('" + email + "')";
  dbCon.query(sql, function(err, results) {
    if (err) {
        throw err;
    }
    const checking_balance = results[0][0].checking_balance;
    console.log(checking_balance);
    objForModifyPortal.checking_balance = checking_balance;
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
    objForModifyPortal.savings_balance = savings_balance;
    RenderIt(req, res);
  });
}

function RenderIt(req, res)
{
  res.render('modifyportal', objForModifyPortal);
}

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log("modifyportal.js: GET");
    console.log(req.session.modEmail);
  const email = req.session.modEmail;
  objForModifyPortal.email = email;
  GetCheckingBalance(req, res, email);
});

function ModifyCheckingTotal(req, res, newTotal, email)
{
  let sql = "CALL modify_checking_funds('" + email + "', '" + newTotal + "')";
  dbCon.query(sql, function(err, results) {
    if (err) {
        throw err;
    }

    RedirectIt(req, res);
  });
}

function ModifySavingsTotal(req, res, newTotal, email)
{
  let sql = "CALL modify_savings_funds('" + email + "', '" + newTotal + "')";
  dbCon.query(sql, function(err, results) {
    if (err) {
        throw err;
    }
    
    RedirectIt(req, res);
  });
}

function RedirectIt(req, res)
{
  res.redirect('/modifyportal');
}

/* POST home page. */
router.post('/', function(req, res, next) {
  console.log("modifyportal.js: POST");
  const action = req.body.action;
  const email = req.session.modEmail;

  if(action == "Checking")
  {
    const newTotal = req.body.checkingtxt;
    ModifyCheckingTotal(req, res, newTotal, email);
  }
  else if(action == "Savings")
  {
    const newTotal = req.body.savingstxt;
    ModifySavingsTotal(req, res, newTotal, email);
  }
  else
  {
    console.log("Action Not Defined");
  }
});

module.exports = router;
