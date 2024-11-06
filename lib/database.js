let mysql = require('mysql2');

var dbConnectionInfo = require('./connectionInfo');

var con = mysql.createConnection({
  host: dbConnectionInfo.host,
  user: dbConnectionInfo.user,
  password: dbConnectionInfo.password,
  port: dbConnectionInfo.port,
  multipleStatements: true              // Needed for stored procedures with OUT results
});

con.connect(function(err) {
  if (err) {
    throw err;
  }
  else {
    console.log("database.js: Connected to server!");
    
    con.query("CREATE DATABASE IF NOT EXISTS bank_application", function (err, result) {
      if (err) {
        console.log(err.message);
        throw err;
      }
      console.log("database.js: bank_application database created if it didn't exist");
      selectDatabase();
    });
  }
});

function selectDatabase() {
    console.log("database.js: Selected bank_application database");
    let sql = "USE bank_application";
    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        // createTables();
        // createStoredProcedures();
        // AddDummyDataToDatabase();
      }
    });
}


function createTables() {
    // A CREATE TABLE call will work if it does not exist or if it does exist.
    // Either way, that's what we want.

    let sql = "CREATE TABLE IF NOT EXISTS user_types (\n" +
                "user_type_id INT NOT NULL AUTO_INCREMENT, \n" +
                "user_type VARCHAR(25) NOT NULL,\n" +
                "PRIMARY KEY (user_type_id) \n" +
              ");";
    con.execute(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: table user_types created if it didn't exist");
      }
    });

    sql = "CREATE TABLE IF NOT EXISTS users (\n" +
                "banker_id INT NOT NULL AUTO_INCREMENT,\n" +
                "email VARCHAR(255) NOT NULL,\n" +
                "hashed_password VARCHAR(255) NOT NULL,\n" +
                "salt VARCHAR(255) NOT NULL,\n" +
                "user_role_id INT NOT NULL,\n" +
                "checking_balance INT,\n" +
                "savings_balance INT,\n" +
                "PRIMARY KEY (banker_id),\n" +
                "FOREIGN KEY (user_role_id) REFERENCES user_types(user_type_id)\n" +
              ")";
    con.execute(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: table users created if it didn't exist");
      }
    });

    sql = "ALTER TABLE users AUTO_INCREMENT = 10000000";
    con.execute(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: Altered Auto-Increment");
      }
    });

    sql = "CREATE TABLE IF NOT EXISTS transfer (\n" +
              "transfer_id INT NOT NULL AUTO_INCREMENT, \n" +
              "toUserEmail VARCHAR(255) NOT NULL,\n" +
              "toUserAccount VARCHAR(255) NOT NULL,\n" +
              "fromUserEmail VARCHAR(255) NOT NULL,\n" +
              "fromUserAccount VARCHAR(255) NOT NULL,\n" +
              "amount INT NOT NULL,\n" +
              "timeSent VARCHAR(50) NOT NULL,\n" +
              "memo VARCHAR(255),\n" +
              "PRIMARY KEY (transfer_id) \n" +
            ");";
    con.execute(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: table transfer created if it didn't exist");
      }
    });
}
  
function createStoredProcedures() {

    let sql = "CREATE PROCEDURE IF NOT EXISTS `insert_user_type`(\n" +
                "IN user_type VARCHAR(45)\n" +
              ")\n" +
              "BEGIN\n" +
                "INSERT INTO user_types (user_type)\n" +
                "SELECT user_type FROM DUAL\n" +
                "WHERE NOT EXISTS (\n" +
                  "SELECT * FROM user_types\n" +
                  "WHERE user_types.user_type=user_type LIMIT 1\n" +
                ");\n" +
              "END;";
    
    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure insert_user_type created if it didn't exist");
      }
    });
  
    sql = "CREATE PROCEDURE IF NOT EXISTS `register_user`(\n" +
                "IN  email VARCHAR(255), \n" +
                "IN  hashed_password VARCHAR(255), \n" +
                "IN  salt VARCHAR(255), \n" +
                "OUT result INT\n" +
              ")\n" +
              "BEGIN\n" +
                "DECLARE nCount INT DEFAULT 0;\n" +
                "SET result = 0;\n" +
                "SELECT Count(*) INTO nCount FROM users WHERE users.email = email;\n" +
                  "IF nCount = 0 THEN\n" +
                    "INSERT INTO users (email, hashed_password, salt, user_role_id, checking_balance, savings_balance)\n" +
                    "VALUES (email, hashed_password, salt, 1, 0, 0);\n" +
                  "ELSE\n" +
                    "SET result = 1;\n" +
                  "END IF;\n" +
              "END;"
    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure register_user created if it didn't exist");
      }
    });

    sql = "CREATE PROCEDURE IF NOT EXISTS `promote_user_type`(\n" +
                "IN  email VARCHAR(255), \n" +
                "OUT result INT\n" +
              ")\n" +
              "BEGIN\n" +
                "UPDATE users \n" +
                "SET user_role_id = user_role_id + 1 \n" +
                "WHERE users.email = email;\n" +
              "END;"
    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure promote_user_type created if it didn't exist");
      }
    });

    sql = "CREATE PROCEDURE IF NOT EXISTS `demote_user_type`(\n" +
                "IN  email VARCHAR(255), \n" +
                "OUT result INT\n" +
              ")\n" +
              "BEGIN\n" +
                "UPDATE users \n" +
                "SET user_role_id = user_role_id - 1 \n" +
                "WHERE users.email = email;\n" +
              "END;"
    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure demote_user_type created if it didn't exist");
      }
    });
  
    sql = "CREATE PROCEDURE IF NOT EXISTS `get_salt`(\n" +
                "IN  email VARCHAR(255)\n" +
              ")\n" +
              "BEGIN\n" +
                "SELECT salt FROM users\n" +
                "WHERE users.email = email\n" +
                "LIMIT 1;\n" +
              "END;";
    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure get_salt created if it didn't exist");
      }
    });
  
    sql = "CREATE PROCEDURE IF NOT EXISTS `check_credentials`(\n" +
                "IN email VARCHAR(255),\n" +
                "IN hashed_password VARCHAR(255),\n" +
                "OUT result INT\n" +
              ")\n" +
              "BEGIN\n" +
                "SELECT EXISTS(\n" +
                  "SELECT * FROM users\n" +
                  "WHERE users.email = email AND users.hashed_password = hashed_password\n" +
                ") AS result;\n" +
              "END;";
    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure check_credentials created if it didn't exist");
      }
    });

    sql = "CREATE PROCEDURE IF NOT EXISTS `get_banker_id`(\n" +
                "IN email VARCHAR(255)\n" +
              ")\n" +
              "BEGIN\n" +
                "SELECT banker_id FROM users\n" +
                "WHERE users.email = email\n" +
                "LIMIT 1;\n" +
              "END;";
    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure get_banker_id created if it didn't exist");
      }
    });
       
    sql = "CREATE PROCEDURE IF NOT EXISTS `get_user_type`(\n" +
                "IN  email VARCHAR(255) \n" +
              ")\n" +
              "BEGIN\n" +
                "SELECT user_role_id FROM users \n" +
                "WHERE users.email = email;\n" +
              "END;"
    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure get_user_type created if it didn't exist");
      }
    });

    sql = "CREATE PROCEDURE IF NOT EXISTS `get_checking_balance`(\n" +
                "IN email VARCHAR(255)\n" +
              ")\n" +
              "BEGIN\n" +
                "SELECT checking_balance FROM users\n" +
                "WHERE users.email = email\n" +
                "LIMIT 1;\n" +
              "END;";
    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure get_checking_balance created if it didn't exist");
      }
    });

    sql = "CREATE PROCEDURE IF NOT EXISTS `get_savings_balance`(\n" +
                "IN email VARCHAR(255)\n" +
              ")\n" +
              "BEGIN\n" +
                "SELECT savings_balance FROM users\n" +
                "WHERE users.email = email\n" +
                "LIMIT 1;\n" +
              "END;";
    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure get_savings_balance created if it didn't exist");
      }
    });

    sql = "CREATE PROCEDURE IF NOT EXISTS `get_transfer_history`(\n" +
                "IN email VARCHAR(255)\n" +
              ")\n" +
              "BEGIN\n" +
                "SELECT toUserEmail, toUserAccount, fromUserEmail, fromUserAccount, amount, timeSent, memo FROM transfer\n" +
                "WHERE transfer.fromUserEmail = email;\n" +
              "END;";
    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure get_transfer_history created if it didn't exist");
      }
    });

    sql = "CREATE PROCEDURE IF NOT EXISTS `transfer`(\n" +
                "IN toUserEmail VARCHAR(255),\n" +
                "IN toUserAccount VARCHAR(255),\n" +
                "IN fromUserEmail VARCHAR(255),\n" +
                "IN fromUserAccount VARCHAR(255),\n" +
                "IN amount INT,\n" +
                "IN memo VARCHAR(255)\n" +
              ")\n" +
              "BEGIN\n" +
                "DECLARE nCount INT DEFAULT 0;\n" +
                "INSERT INTO transfer (toUserEmail, toUserAccount, fromUserEmail, fromUserAccount, amount, timeSent, memo)\n" +
                "VALUES (toUserEmail, toUserAccount, fromUserEmail, fromUserAccount, amount, CURRENT_TIMESTAMP(), memo);\n" +
              "END;";
    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure transfer created if it didn't exist");
      }
    });

    sql = "CREATE PROCEDURE IF NOT EXISTS `change_client_password`(\n" +
                "IN email VARCHAR(255),\n" +
                "IN new_password VARCHAR(255),\n" +
                "OUT result INT\n" +
              ")\n" +
              "BEGIN\n" +
                "UPDATE users\n" +
                "SET users.hashed_password = new_password\n" +
                "WHERE users.email = email;\n" +
              "END;";
    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure change_client_password created if it didn't exist");
      }
    });

    sql = "CREATE PROCEDURE IF NOT EXISTS `modify_checking_funds`(\n" +
                "IN email VARCHAR(255),\n" +
                "IN amount INT\n" +
              ")\n" +
              "BEGIN\n" +
                "UPDATE users\n" +
                "SET users.checking_balance = amount\n" +
                "WHERE users.email = email;\n" +
              "END;";
    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure modify_checking_funds created if it didn't exist");
      }
    });

    sql = "CREATE PROCEDURE IF NOT EXISTS `modify_savings_funds`(\n" +
                "IN email VARCHAR(255),\n" +
                "IN amount INT\n" +
              ")\n" +
              "BEGIN\n" +
                "UPDATE users\n" +
                "SET users.savings_balance = amount\n" +
                "WHERE users.email = email;\n" +
              "END;";
    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure modify_savings_funds created if it didn't exist");
      }
    });

    sql = "CREATE PROCEDURE IF NOT EXISTS `get_users_of_type`(\n" +
                "IN user_role_id INT,\n" +
                "OUT result INT\n" +
              ")\n" +
              "BEGIN\n" +
                "SELECT email FROM USERS\n" +
                "WHERE users.user_role_id = user_role_id;\n" +
              "END;";
    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure get_users_of_type created if it didn't exist");
      }
    });
}
  
function AddDummyDataToDatabase() {
    let sql = "CALL insert_user_type('customer')";
    con.query(sql, function(err,rows){
      if (err) {
        console.log(err.message);
        throw err;
      }
      console.log("database.js: Added 'customer' to user_types");
    });

    sql = "CALL insert_user_type('employee')";
    con.query(sql, function(err,rows){
      if (err) {
        console.log(err.message);
        throw err;
      }
      console.log("database.js: Added 'employee' to user_types");
    });

    sql = "CALL insert_user_type('admin')";
    con.query(sql, function(err,rows){
      if (err) {
        console.log(err.message);
        throw err;
      }
      console.log("database.js: Added 'admin' to user_types");
    });

    sql = "CALL register_user('admin@gmail.com', '1dc5a76e202de3e9b3128242090172b6f84a7b108758659d0a11d13147aeed4c', 'd1afc39bb2ca1b91', @result);"
    con.query(sql, function(err,rows){
      if (err) {
        console.log(err.message);
        throw err;
      }
      console.log("database.js: Added the admin user");
    });

    sql = "CALL promote_user_type('admin@gmail.com', @result)"
    con.query(sql, function(err,rows){
      if (err) {
        console.log(err.message);
        throw err;
      }
      console.log("database.js: Change Admin from customer user to an Employee user");
    });

    sql = "CALL promote_user_type('admin@gmail.com', @result)"
    con.query(sql, function(err,rows){
      if (err) {
        console.log(err.message);
        throw err;
      }
      console.log("database.js: Change Admin from Employee user to an Admin user");
    });

    sql = "CALL register_user('Employee@gmail.com', 'ecc6c8a54d73a19c6503e329f873d2a61bb6a88be9da50a50df3a70137e688f6', '9c2c422c011c8117', @result);"
    con.query(sql, function(err,rows){
      if (err) {
        console.log(err.message);
        throw err;
      }
      console.log("database.js: Added the Employee user");
    });

    sql = "CALL promote_user_type('Employee@gmail.com', @result)"
    con.query(sql, function(err,rows){
      if (err) {
        console.log(err.message);
        throw err;
      }
      console.log("database.js: Change Employee from customer user to an Employee user");
    });

    // Creates 3 Example Users
    sql = "CALL register_user('AustinBry@gmail.com', '518210a7b7adc34a3aac2d440bb3a2796a07e3bcc918783559528b44ca5ab26a', 'dc1998bcdb6320d', @result);"
    con.query(sql, function(err,rows){
      if (err) {
        console.log(err.message);
        throw err;
      }
      console.log("database.js: Added customer1 user");
    });
      
    sql = "CALL register_user('IsaacTurk@gmail.com', '518210a7b7adc34a3aac2d440bb3a2796a07e3bcc918783559528b44ca5ab26a', 'dc1998bcdb6320d', @result);"
    con.query(sql, function(err,rows){
      if (err) {
        console.log(err.message);
        throw err;
      }
      console.log("database.js: Added the customer2 user");
    });

    sql = "CALL register_user('SteveDee@gmail.com', '518210a7b7adc34a3aac2d440bb3a2796a07e3bcc918783559528b44ca5ab26a', 'dc1998bcdb6320d', @result);"
    con.query(sql, function(err,rows){
      if (err) {
        console.log(err.message);
        throw err;
      }
      console.log("database.js: Added the customer3 user");
    });

    // Creates 3 Transfer Statements
    sql = "CALL transfer('AustinBry@gmail.com', 'Savings Account', 'IsaacTurk@gmail.com', 'Checking Account', 100, 'Tonight');"
    con.query(sql, function(err,rows){
      if (err) {
        console.log(err.message);
        throw err;
      }
      console.log("database.js: Transfer Function Ex1");
    });

    sql = "CALL transfer('SteveDee@gmail.com', 'Checking Account', 'AustinBry@gmail.com', 'Checking Account', 1000, 'You Deserve This');"
    con.query(sql, function(err,rows){
      if (err) {
        console.log(err.message);
        throw err;
      }
      console.log("database.js: Transfer Function Ex2");
    });

    sql = "CALL transfer('IsaacTurk@gmail.com', 'Savings Account', 'SteveDee@gmail.com', 'Savings Account', 1, 'haha');"
    con.query(sql, function(err,rows){
      if (err) {
        console.log(err.message);
        throw err;
      }
      console.log("database.js: Transfer Function Ex3");
    });
}

module.exports = con;