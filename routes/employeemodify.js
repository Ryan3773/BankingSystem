var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');

objForEmpModifyEJS = {};

function GetUsersOfType(req, res)
{
    let sql = "CALL get_users_of_type('" + 1 + "', @result); select @result";
    dbCon.query(sql, function(err, rows) {
        if (err) {
            throw err;
        }
        if (rows[0][0] === undefined) {
            console.log("employeemdoify: No results found");
            res.render('employeeportal', {message: "User_role_id: '" + 1 + "' not found"});
        } else {
            objForEmpModifyEJS.allEmails = rows[0];
            console.log(objForEmpModifyEJS.allEmails.length);
            console.log(objForEmpModifyEJS.allEmails[0].email);
            RenderIt(req, res, objForEmpModifyEJS);
        }
    });
}

function RenderIt(req, res, objForEmpModifyEJS)
{
    console.log(objForEmpModifyEJS.allEmails.length);
    console.log(objForEmpModifyEJS.allEmails[0].email);
    res.render('employeemodify', objForEmpModifyEJS);
}

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log("employeemodify.js: GET");
    GetUsersOfType(req, res);
});

router.post('/', function(req, res, next) {
    console.log("employeemodify.js: POST");
    const email = req.body.email;
    req.session.modEmail = email;
    req.session.save(function(err) {
        if (err) {
            throw err;
        }
       
        res.redirect("/modifyportal");
    });
});

module.exports = router;
