var express = require('express');
var router = express.Router();

var CryptoJS = require('crypto-js');
var SHA256 = CryptoJS.SHA256();

var dbCon = require('../lib/database');

function SaveEmail(req, res)
{
    const email = req.body.email;
    req.session.email = email;
    req.session.save(function(err) {
        if (err) {
            throw err;
        }
       
        GetSalt(req, res, email);
    });
}

function GetSalt(req, res) {
    const email = req.body.email;
    req.session.email = email;

    let sql = "CALL get_salt('" + email + "')";
    dbCon.query(sql, function(err, results) {
        if (err) {
            throw err;
        }
        if (results[0][0] === undefined) {
            console.log("adminlogin: No results found");
            res.render('adminlogin', {message: "User '" + email + "' not found"});
        } else {
            const salt = results[0][0].salt;
            req.session.salt = salt;
            CheckUserType(req, res, salt, email);
        }
    });
}

function CheckUserType(req, res, salt, email)
{
    sql = "CALL get_user_type('" + email + "')";
          dbCon.query(sql, function(err, results) {
            if (err) {
                throw err;
            }

            if (results[0][0] === undefined) {
                console.log("adminlogin: No results found");
                res.render('adminlogin', {message: "User '" + email + "' Type not found"});
            }

            console.log(results[0][0].user_role_id);

            if (results[0][0].user_role_id == 3) {
                console.log("User Detected");
                CheckCredentials(req, res, salt, email);
            } else {
                console.log("ERROR: Incorrect account type")
            }
        });
}

function CheckCredentials(req, res, salt, email)
{
    const password = req.body.password;
    const hashedPassword = CryptoJS.SHA256(password + ":" + salt).toString(CryptoJS.enc.Hex);

    let sql = "CALL check_credentials('" + email + "', '" + hashedPassword + "', @result); select @result";
    dbCon.query(sql, function(err, results) {
        if (err) {
            throw err;
        }

        if (results[0][0] === undefined || results[0][0].result == 0) {
            console.log("adminlogin.js: No login credentials found");
            res.render('adminlogin', {message: "Password not valid for user '" + email + "'.  Please log in again."});
        } else {
            console.log("adminlogin.js: Credentials matched");
            req.session.loggedIn = true;
            req.session.save(function(err) {
                if (err) {
                    throw err;
                }
               
                RenderIt(req, res);
            });
        }
    });
}

function RenderIt(req, res)
{
    res.redirect("/adminmodify");
}

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log("adminlogin.js: GET");
  res.render('adminlogin', { });
});

router.post('/', function(req, res, next) {
    console.log("adminlogin.js: POST");
    SaveEmail(req, res);
});

module.exports = router;
