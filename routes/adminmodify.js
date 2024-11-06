var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');

var CryptoJS = require('crypto-js');
var SHA256 = CryptoJS.SHA256();

objForAdminModifyEJS = {};

function GetCustomers(req, res)
{
    let sql = "CALL get_users_of_type('" + 1 + "', @result); select @result";
    dbCon.query(sql, function(err, rows) {
        if (err) {
            throw err;
        }
        if (rows[0][0] === undefined) {
            console.log("adminmodify: No results found");
            res.render('adminmodify', { });
        } else {
            objForAdminModifyEJS.allCustomerEmails = rows[0];
            GetEmployees(req, res, objForAdminModifyEJS);
        }
    });
}

function GetEmployees(req, res, objForAdminModifyEJS)
{
    let sql = "CALL get_users_of_type('" + 2 + "', @result); select @result";
    dbCon.query(sql, function(err, rows) {
        if (err) {
            throw err;
        }
        if (rows[0][0] === undefined) {
            console.log("adminmodify: No results found");
            res.render('adminmodify', { });
        } else {
            objForAdminModifyEJS.allEmployeeEmails = rows[0];
            RenderIt(req, res, objForAdminModifyEJS);
        }
    });
}

function RenderIt(req, res, objForAdminModifyEJS)
{
    res.render('adminmodify', objForAdminModifyEJS);
}

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log("adminmodify.js: GET");
  GetCustomers(req, res);
});

//Promoting User Route 1
function CheckUserType(req, res, email)
{
    sql = "CALL get_user_type('" + email + "')";
          dbCon.query(sql, function(err, results) {
            if (err) {
                throw err;
            }

            if (results[0][0] === undefined) {
                console.log("adminmodify: No results found");
                RenderPost(req, res);
            }

            console.log(results[0][0].user_role_id);

            if (results[0][0].user_role_id == 1) {
                console.log("User Detected");
                Promote(req, res, email);
            } 
            else if(results[0][0].user_role_id == 2)
            {
                console.log("User Detected");
                EmployeeFundsCheck(req, res, email);
            }
            else
            {
                console.log("ERROR UserType Not Detected");
            }
        });
}

function EmployeeFundsCheck(req, res, email)
{
    const checkingBalance = GetCheckingBalance(req, res, email);
    const savingsBalance = GetSavingsBalance(req, res, email);

    if(checkingBalance > 0)
    {
        console.log("Checking Balance is greater than 0");
        RenderPost(req, res);
    }
    else if(savingsBalance > 0)
    {
        console.log("Savings Balance is greater than 0");
        RenderPost(req, res);
    }
    else
    {
        Promote(req, res, email);
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
        return checking_balance;
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
        return savings_balance;
    });
}

function Promote(req, res, email)
{
    let sql = "CALL promote_user_type('" + email + "', @result); select @result;";
    dbCon.query(sql, function(err, results) {
        if (err) {
            throw err;
        }

        if (results[0][0] === undefined || results[0][0].result == 0) {
            console.log("adminmodify.js: Promoting Failed");
            RenderPost(req, res);
        } else {
            console.log("adminmodify.js: Promoted User:" + email);
            RenderPost(req, res);
        }
    });
}

//Demote User Route 2
function Demote(req, res, email)
{
    sql = "CALL demote_user_type('" + email + "', @result); select @result;";
    dbCon.query(sql, function(err, results) {
        if (err) {
            throw err;
        }

        if (results[0][0] === undefined || results[0][0].result == 0) {
            console.log("adminmodify.js: Demoting Failed");
            RenderPost(req, res);
        } else {
            console.log("adminmodify.js: Demoted User:" + email);
            RenderPost(req, res);
        }
    });
}

//Reseting Password Route 3
function GetSalt(req, res, email) {
    let sql = "CALL get_salt('" + email + "')";
    dbCon.query(sql, function(err, results) {
        if (err) {
            throw err;
        }
        if (results[0][0] === undefined) {
            console.log("customerlogin: No results found");
            RenderPost(req, res);
        } else {
            const salt = results[0][0].salt;
            ChangePassword(req, res, email, salt);
        }
    });
}

function ChangePassword(req, res, email, salt)
{
    const newPassword = req.body.newPassword;
    const newHashedPassword = CryptoJS.SHA256(newPassword + ":" + salt).toString(CryptoJS.enc.Hex);
    console.log(newHashedPassword);
    let sql = "CALL change_client_password('" + email + "', '" + newHashedPassword + "', @result); select @result";
    dbCon.query(sql, function(err, results) {
        if (err) {
            throw err;
        }

        RenderPost(req, res);
    });
}

function RenderPost(req, res)
{
    res.redirect('/adminmodify');
}



/* POST home page. */
router.post('/', function(req, res, next) {
    console.log("adminmodify.js: POST");
    const email = req.body.email;
    const action = req.body.action;

    if(action == "Promote")
    {
        //Route 1
        CheckUserType(req, res, email);
    }
    else if(action == "Demote")
    {
        //Route 2
        Demote(req, res, email);
    }
    else if(action == "ResetPassword")
    {
        //Route 3
        GetSalt(req, res, email);
    }
    else
    {
        console.log("ERROR");
    }
});

module.exports = router;
