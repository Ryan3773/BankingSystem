var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log("register.js: GET");
  res.render('register', { });
});

router.post('/', function(req, res, next) {
    console.log("register.js: POST");
        // Get three values from POST from the client
        const email = req.body.email;
        console.log(email);
        const salt = req.body.salt;
        const hash = req.body.hash;
        console.log("register.js: email: " + email + " salt: " + salt + " hash: " + hash);
        let sql = "CALL register_user(?, ?, ?, @result); select @result";
        dbCon.query(sql, [email, hash, salt], function(err, rows) {
           if (err) {
            throw err;
           } 
           if (rows[1][0]['@result'] == 0) {
                // Successful registration!
                // Set the sessions variable for this
                req.session.email = email;
                req.session.loggedIn = true;
    
                // Since session updates aren't synchronous and automatic because they are inserted into the MySQL database
                // we have to wait for the database to come back with a result.  req.session.save() will trigger a function when 
                // the save completes
                req.session.save(function(err) {
                    if (err) {
                        throw err;
                    }
                    console.log("register.js: Successful registration, a session field is: " + req.session.email);
                    
                    // Redirect the user to the home page.  Let that redirect the user to the next correct spot.
                    res.redirect('/customerportal');
                });
            } else {
                //This user account already exists
                console.log("register.js: Email is already in use.  Reload register page with that message.");
                res.render('register', {message: "The username '" + email + "' already exists"});
            }
        });
});

module.exports = router;
