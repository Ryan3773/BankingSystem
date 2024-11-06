var express = require('express');
var router = express.Router();

var CryptoJS = require('crypto-js');
var SHA256 = CryptoJS.SHA256();

var dbCon = require('../lib/database');

function GetSalt(req, res) {
    const email = req.session.email;

    let sql = "CALL get_salt('" + email + "')";
    dbCon.query(sql, function(err, results) {
        if (err) {
            throw err;
        }
        if (results[0][0] === undefined) {
            console.log("employeeacct: No results found");
            res.render('employeeacct', {message: "User '" + email + "' not found"});
        } else {
            const salt = results[0][0].salt;
            req.session.salt = salt;
            CheckCredentials(req, res, salt, email);
        }
    });
}

function CheckCredentials(req, res, salt, email)
{
    const oldPassword = req.body.oldPassword;
    const hashedPassword = CryptoJS.SHA256(oldPassword + ":" + salt).toString(CryptoJS.enc.Hex);

    let sql = "CALL check_credentials('" + email + "', '" + hashedPassword + "', @result); select @result";
    dbCon.query(sql, function(err, results) {
        if (err) {
            throw err;
        }

        if (results[0][0] === undefined || results[0][0].result == 0) {
            console.log("employeeacct.js: No login credentials found");
            res.render('employeeacct', {message: "Password not valid for user '" + email + "'.  Please log in again."});
        } else {
            console.log("employeeacct.js: Credentials matched");
            ChangePassword(req, res, email, salt);
        }
    });
}

function ChangePassword(req, res, email, salt)
{
    const newPassword = req.body.newPassword;
    const newHashedPassword = CryptoJS.SHA256(newPassword + ":" + salt).toString(CryptoJS.enc.Hex);

    let sql = "CALL change_client_password('" + email + "', '" + newHashedPassword + "', @result); select @result";
    dbCon.query(sql, function(err, results) {
        if (err) {
            throw err;
        }

        RenderIt(req, res);
    });
}

function RenderIt(req, res)
{
  res.redirect("/employeeportal");
}

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log("employeeacct.js: GET");
  res.render('employeeacct', { });
});

/* POST page */
router.post('/', function(req, res, next) {
  console.log("employeeacct.js: POST");
GetSalt(req, res);
});

module.exports = router;
