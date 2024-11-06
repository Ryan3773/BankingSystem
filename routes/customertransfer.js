var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');
objForCustTransferEJS = {}

let sequence = 0;

function StepOne(req, res)
{
  const fromAccount = req.body.fromAccount;
  const fromEmail = req.session.email;
  if(fromAccount == "CA")
  {
    GetCheckingBalance(req, res, fromEmail);
  }
  else if(fromAccount == "SA")
  {
    GetSavingsBalance(req, res, fromEmail);
  }
}

function GetCheckingBalance(req, res, email)
{
  let sql = "CALL get_checking_balance('" + email + "')";
  dbCon.query(sql, function(err, results) {
    if (err) {
        throw err;
    }
    const checking_balance = results[0][0].checking_balance;
    if(sequence == 0)
    {
      sequence++;
      RemoveFunds(req, res, checking_balance);
    }
    else if (sequence == 1)
    {
      AddFunds(req, res, checking_balance)
    }
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
    if(sequence == 0)
      {
        sequence++;
        RemoveFunds(req, res, savings_balance);
      }
      else if (sequence == 1)
      {
        AddFunds(req, res, savings_balance)
      }
  });
}

function RemoveFunds(req, res, balance)
{
  console.log("Remove");
  const fromEmail = req.session.email;
  const fromAccount = req.body.fromAccount;
  const amount = req.body.amount;
  console.log(fromAccount);
  if(fromAccount == "CA")
  {
    if(amount > balance)
    {
      console.log("ERROR: Checking Account Lacks the Money");
      res.render('customertransfer', {message: "Checking Account has: '" + balance + "' - Not Enough"});
    }

    let newTotal = balance - amount;
    let sql = "CALL modify_checking_funds('" + fromEmail + "', '" + newTotal + "')";
    dbCon.query(sql, function(err, rows) {
        if (err) {
            throw err;
        }

        StepTwo(req, res);
    });

  }
  else if (fromAccount == "SA")
  {
    if(amount > balance)
    {
      console.log("ERROR: Savings Account Lacks the Money");
      res.render('customertransfer', {message: "Savings Account has: '" + balance + "' - Not Enough"});
    }

    let newTotal = balance - amount;
    let sql = "CALL modify_savings_funds('" + fromEmail + "', '" + newTotal + "')";
    dbCon.query(sql, function(err, rows) {
        if (err) {
            throw err;
        }

        StepTwo(req, res);
    });
  }
  else
  {
    console.log("ERROR: From isn't one of the Choices");
    res.render('customertransfer', {message: "From: '" + fromAccount + "'"});
  }
}

function StepTwo(req, res)
{
  const toAccount = req.body.toAccount;
  const toEmail = req.body.toEmail;
  if(toAccount == "CA")
  {
    GetCheckingBalance(req, res, toEmail);
  }
  else if(toAccount == "SA")
  {
    GetSavingsBalance(req, res, toEmail);
  }
}

function AddFunds(req, res, balance)
{
  console.log("Add");
  const toEmail = req.body.toEmail;
  const toAccount = req.body.toAccount;
  const amount = req.body.amount;

  if(toAccount == "CA")
  {
    let newTotal = balance + amount;
    let sql = "CALL modify_checking_funds('" + toEmail + "', '" + newTotal + "')";
    dbCon.query(sql, function(err, rows) {
        if (err) {
            throw err;
        }

        LogTransfer(req, res);
    });

  }
  else if (toAccount == "SA")
  {
    let newTotal = balance + amount;
    let sql = "CALL modify_savings_funds('" + toEmail + "', '" + newTotal + "')";
    dbCon.query(sql, function(err, rows) {
        if (err) {
            throw err;
        }

        LogTransfer(req, res);
    });
  }
  else
  {
    console.log("ERROR: To isn't one of the Choices");
    res.render('customertransfer', {message: "From: '" + fromAccount + "'"});
  }
}

function LogTransfer(req, res)
{
  console.log("Log");
  const fromEmail = req.session.email;
  const fromAccount = req.body.fromAccount;
  const toEmail = req.body.toEmail;
  const toAccount = req.body.toAccount;
  const amount = req.body.amount;
  const memo = req.body.memo;

    if(!memo)
    {
      memo = " ";
    }

    let sql = "CALL transfer('" + toEmail + "', '" + toAccount + "', '" + fromEmail + "', '" + fromAccount + "', '" + amount + "', '" + memo + "')";
    dbCon.query(sql, function(err, rows) {
          if (err) {
            throw err;
          }

          RedirectIt(req, res);
    });
}

function RedirectIt(req, res)
{
  console.log("Redirect");
  res.redirect('/customertransfer');
}

function GetTransferHistory(req, res)
{
  const email = req.session.email;
  objForCustTransferEJS.email = email;
  let sql = "CALL get_transfer_history('" + email + "')";
  dbCon.query(sql, function(err, result, rows, fields) {
      if (err) {
          throw err;
      }
      if (rows[0][0] === undefined) {
          console.log("customertransfer: No results found");
          res.render('customertransfer', {message: "Couldn't Get Transfer History"});
      } else {
        console.log(result);
        objForCustTransferEJS.result = result;
        RenderIt(req, res);
      }
  });
}

function RenderIt(req, res)
{
  res.render('customertransfer', objForCustTransferEJS);
}

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log("customertransfer.js: GET");
  GetTransferHistory(req, res);
});

router.post('/', function(req, res, next) {
    console.log("customertransfer.js: POST");
  StepOne(req, res)
});

module.exports = router;
