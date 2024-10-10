let mysql = require('mysql2');

var dbConnectionInfo = require('./connectionInfo');

var con = mysql.createConnection({
  host: dbConnectionInfo.host,
  user: dbConnectionInfo.user,
  password: dbConnectionInfo.password,
  port: dbConnectionInfo.port,
  multipleStatements: true              // Needed for stored proecures with OUT results
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
    let sql = "USE bank_application";
    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: Selected bank_application database");
        createTables();
        createStoredProcedures();
        AddDummyDataToDatabase();
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
                "user_id INT NOT NULL AUTO_INCREMENT,\n" +
                "email VARCHAR(255) NOT NULL,\n" +
                "hashed_password VARCHAR(255) NOT NULL,\n" +
                "salt VARCHAR(255) NOT NULL,\n" +
                "user_role_id INT NOT NULL,\n" +
                "checking_balance INT,\n" +
                "saving_balance INT,\n" +
                "PRIMARY KEY (user_id),\n" +
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

    sql = "CREATE TABLE IF NOT EXISTS transfer (\n" +
              "transfer_id INT NOT NULL AUTO_INCREMENT, \n" +
              "toUser VARCHAR(50) NOT NULL,\n" +
              "fromUser VARCHAR(50) NOT NULL,\n" +
              "amount INT NOT NULL,\n" +
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
  
    sql = "CREATE TABLE IF NOT EXISTS transfer_history (\n" +
              "transfer_history_id INT NOT NULL AUTO_INCREMENT, \n" +
              "user_id INT NOT NULL,\n" +
              "transfer_id INT NOT NULL,\n" +
              "PRIMARY KEY (transfer_history_id), \n" +
              "FOREIGN KEY (user_id) REFERENCES users(user_id),\n" +
              "FOREIGN KEY (transfer_id) REFERENCES transfer(transfer_id)\n" +
            ");";
    con.execute(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: table transfer_history created if it didn't exist");
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
                      "INSERT INTO users (email, hashed_password, salt, user_role_id, checking_balance, saving_balance)\n" +
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
                  "IN  user_id INT, \n" +
                  "OUT result INT\n" +
              ")\n" +
              "BEGIN\n" +
                  "UPDATE users \n" +
                  "SET user_role_id = user_role_id + 1 \n" +
                  "WHERE users.user_id = user_id;\n" +
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
                  "IN  user_id INT, \n" +
                  "OUT result INT\n" +
              ")\n" +
              "BEGIN\n" +
                  "UPDATE users \n" +
                  "SET user_role_id = user_role_id - 1 \n" +
                  "WHERE users.user_id = user_id;\n" +
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
              "IN user_id INT\n" +
          ")\n" +
          "BEGIN\n" +
              "SELECT salt FROM users\n" +
              "WHERE users.user_id = user_id\n" +
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
              "IN user_id INT,\n" +
              "IN hashed_password VARCHAR(50),\n" +
              "OUT result INT\n" +
          ")\n" +
          "BEGIN\n" +
              "SELECT EXISTS(\n" +
                "SELECT * FROM users\n" +
                "WHERE users.user_id = user_id AND users.hashed_password = hashed_password\n" +
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

    sql = "CREATE PROCEDURE IF NOT EXISTS `get_checking_balance`(\n" +
              "IN user_id INT\n" +
          ")\n" +
          "BEGIN\n" +
              "SELECT checkingbalance FROM users\n" +
              "WHERE users.user_id = user_id\n" +
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

    sql = "CREATE PROCEDURE IF NOT EXISTS `get_saving_balance`(\n" +
              "IN user_id INT\n" +
          ")\n" +
          "BEGIN\n" +
              "SELECT savingbalance FROM users\n" +
              "WHERE users.user_id = user_id\n" +
              "LIMIT 1;\n" +
          "END;";
  
    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure get_saving_balance created if it didn't exist");
      }
    });

    sql = "CREATE PROCEDURE IF NOT EXISTS `get_transfer_history`(\n" +
              "IN user_id INT\n" +
          ")\n" +
          "BEGIN\n" +
              "SELECT transfer.toUser, transfer.fromUser, transfer.amount, transfer.memo FROM transfer_history\n" +
              "INNER JOIN transfer ON transfer_history.transfer_id = transfer.transfer_id\n" +
              "WHERE users.user_id = user_id;\n" +
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
                      "IN user_id INT,\n" +
                      "IN toUser VARCHAR(50),\n" +
                      "IN fromUser VARCHAR(50),\n" +
                      "IN amount INT,\n" +
                      "IN memo VARCHAR(255)\n" +
                  ")\n" +
                  "BEGIN\n" +
                  "DECLARE nCount INT DEFAULT 0;\n" +
                    "INSERT INTO transfer (toUser, fromUser, amount, memo)\n" +
                    "VALUES (toUser, fromUser, amount, memo);\n" +
                    "SELECT Count(*) INTO nCount FROM transfer;\n" +
                    "INSERT INTO transfer_history (user_id, transfer_id)\n" +
                    "VALUES (user_id, nCount);\n" +
              "END;";
    
    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure transfer created if it didn't exist");
      }
    });

    sql = "CREATE PROCEDURE IF NOT EXISTS `change_password`(\n" +
                      "IN user_id INT,\n" +
                      "IN prev_password VARCHAR(50),\n" +
                      "IN new_password VARCHAR(50),\n" +
                      "OUT result INT\n" +
                  ")\n" +
                  "BEGIN\n" +
                  "CALL check_credentials(user_id, prev_password, @result);\n" +
                  "IF result = 1 THEN\n" +
                    "UPDATE users\n" +
                    "SET hashed_password = new_password\n" +
                    "WHERE users.user_id = user_id;\n" +
                  "ELSE\n" +
                    "SET result = 1;\n" +
                  "END IF;\n" +
              "END;";
    
    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure change_password created if it didn't exist");
      }
    });

    sql = "CREATE PROCEDURE IF NOT EXISTS `change_client_password`(\n" +
                      "IN user_id INT,\n" +
                      "IN new_password VARCHAR(50),\n" +
                      "OUT result INT\n" +
                  ")\n" +
                  "BEGIN\n" +
                    "UPDATE users\n" +
                    "SET hashed_password = new_password\n" +
                    "WHERE users.user_id = user_id;\n" +
              "END;";
    
    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure insert_user_type created if it didn't exist");
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

    sql = "CALL register_user('admin@gmail.com', '518210a7b7adc34a3aac2d440bb3a2796a07e3bcc918783559528b44ca5ab26a', 'dc1998bcdb6320d', @result);"
    con.query(sql, function(err,rows){
      if (err) {
        console.log(err.message);
        throw err;
      }
      console.log("database.js: Added the admin user");
    });

    sql = "CALL promote_user_type(1, @result)"
    con.query(sql, function(err,rows){
      if (err) {
        console.log(err.message);
        throw err;
      }
      console.log("database.js: Change Admin from customer user to an Employee user");
    });

    con.query(sql, function(err,rows){
        if (err) {
          console.log(err.message);
          throw err;
        }
        console.log("database.js: Change Admin from Employee user to an Admin user");
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
      sql = "CALL transfer('3', 'AustinBry', 'IssacTurk', 100, 'Tonight');"
      con.query(sql, function(err,rows){
        if (err) {
          console.log(err.message);
          throw err;
        }
        console.log("database.js: Transfer Function Ex1");
      });

      sql = "CALL transfer('2', 'SteveDee', 'AustinBry', 1000, 'You Deserve This');"
      con.query(sql, function(err,rows){
        if (err) {
          console.log(err.message);
          throw err;
        }
        console.log("database.js: Transfer Function Ex2");
      });

      sql = "CALL transfer('4', 'IssacTurk', 'SteveDee', 1, 'haha');"
      con.query(sql, function(err,rows){
        if (err) {
          console.log(err.message);
          throw err;
        }
        console.log("database.js: Transfer Function Ex3");
      });
}

module.exports = con;