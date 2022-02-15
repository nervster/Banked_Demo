const express = require('express');
const mysql = require('./demo_db_conn.js');
const path = require('path');
const ejsMate = require('ejs-mate');
const bodyParser = require("body-parser");
const { json } = require('body-parser');
const { all } = require('express/lib/application');
// var handlebars = require('express-handlebars').create({defaultLayout:'main'});
// app.engine('handlebars', handlebars.engine);
// app.set('view engine', 'handlebars');
const app = express();

const current_user = 1

//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))
app.set('port', 3000);

var getDaysInCurrentMonth = function() {
    var today = new Date()
   return new Date(today.getFullYear(), today.getMonth()+1 , 0).getDate();

  };

app.get('/',function(req,res,next){
  var context = {};
  var today = new Date();
  mysql.pool.query('SELECT * FROM allowance where user_id = (?) ORDER BY latest_timestamp desc',[current_user], function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
   
    context.results = JSON.parse(JSON.stringify(rows));
    var allowance_date = new Date(context.results[0].allowance_last_updated)
    num_days_last_update = Math.floor((today - allowance_date)/ (1000 * 3600 * 24))
    if ( num_days_last_update > 1) {
      context.results[0].current_allowance += context.results[0].daily_allowance * num_days_last_update

      // update allowance table 
      mysql.pool.query("UPDATE allowance set current_allowance = (?), allowance_last_updated = (?) where user_id = (?)", 
      [context.results[0].current_allowance, today.toISOString().slice(0, 19).replace('T', ' '), current_user], 
          function(err, result){
          if(err){
            next(err);
            return;
          }
      console.log("Updated " + result.changedRows + " rows.");
    });
    }

    res.render('home', context);
  });



});

app.get('/expense',function(req,res,next){
    var context = {};
  //   mysql.pool.query('SELECT * FROM todo', function(err, rows, fields){
  //     if(err){
  //       next(err);
  //       return;
  //     }
      // context.results = JSON.stringify(rows);
      res.render('add_expense', context);
    });

app.get('/budget',function(req,res,next){
    var context = {"daily_allowance" : 0};
    
    let updateBudget = () =>
      mysql.pool.query('SELECT * FROM budget where user_id = (?) and created_timestamp = (select max(created_timestamp) from budget where user_id = (?))', [current_user, current_user], function(err, rows, fields){
      if(err){
        next(err);
        return;
      }
      var budget = 0;
      for (const ob in rows){
        budget += rows[ob].amount
        var type = rows[ob].monthly_expense_type
        if (rows[ob].monthly_expense_type == 'monthly_income') {
          context[type] = rows[ob].amount;
        } else {
          context[type] = rows[ob].amount * -1;
        }
        
      }
      
      context.daily_allowance = budget/getDaysInCurrentMonth();
      delete context['_locals'];
      res.render('budget', context)
    });
    updateBudget();
    });

app.post('/budget',function(req,res,next){

    var context = {};
    
    let multipleRowInsert = () => {
  
          // Query to insert multiple rows
          let query = `INSERT INTO budget 
              (user_id,monthly_expense_type,amount) VALUES ?;`;
        
          // Values to be inserted
          var values = [];
          for (let x in req.body) {
            context[x] = req.body[x]
            if (x=="monthly_income") {
              var value = [current_user, x, req.body[x]*1];
            } else {
              var value = [current_user, x, -1*req.body[x]];
            }
            values.push(value);
          }
          console.log(values)
        
          // Executing the query
          mysql.pool.query(query, [values], (err, rows) => {
              if (err) throw err;
              console.log("All Rows Inserted");
              
          });
      };

    let updateAllowanceTable = (daily_allowance) => {
      mysql.pool.query("SELECT COUNT(1) as user_count from allowance where user_id = (?)", current_user, function(err, rows, fields){
        if(err){
          next(err);
          return;
        }
        count = JSON.parse(JSON.stringify(rows))
        if (count[0].user_count > 0) {
          mysql.pool.query("UPDATE allowance set daily_allowance = (?) where user_id = (?)", [daily_allowance, current_user], function(err, result){
            if(err){
              next(err);
              return;
            }
            console.log("Updated " + result.changedRows + " rows.");
          });
        } else {
          var today = new Date().toISOString().slice(0, 19).replace('T', ' ');
          console.log("updated allowance date: " + today);
          mysql.pool.query(`INSERT INTO allowance (user_id, daily_allowance, current_allowance, allowance_last_updated, total_bank) VALUES (?,?,?,?,?);`, [current_user, daily_allowance,daily_allowance,today, 0.0], 
            function(err, result){
            if(err){
              next(err);
              return;
            }
            console.log("Inserted id " + result.insertId);
          });
        } ;
      });
    }

    multipleRowInsert();
    daily_allowance = req.body.monthly_income - req.body.monthly_housing - req.body.monthly_car - req.body.monthly_subscriptions - req.body.monthly_other
    context.daily_allowance = daily_allowance / getDaysInCurrentMonth()
    updateAllowanceTable(context.daily_allowance);
    console.log(context)
    res.render('budget', context);
    });

app.get('/insert',function(req,res,next){
  var context = {};
  mysql.pool.query("INSERT INTO todo (`name`) VALUES (?)", [req.query.c], function(err, result){
    if(err){
      next(err);
      return;
    }
    context.results = "Inserted id " + result.insertId;
    res.render('home',context);
  });
});

app.get('/delete',function(req,res,next){
  var context = {};
  mysql.pool.query("DELETE FROM todo WHERE id=?", [req.query.id], function(err, result){
    if(err){
      next(err);
      return;
    }
    context.results = "Deleted " + result.changedRows + " rows.";
    res.render('home',context);
  });
});


///simple-update?id=2&name=The+Task&done=false&due=2015-12-5
app.get('/simple-update',function(req,res,next){
  var context = {};
  mysql.pool.query("UPDATE todo SET name=?, done=?, due=? WHERE id=? ",
    [req.query.name, req.query.done, req.query.due, req.query.id],
    function(err, result){
    if(err){
      next(err);
      return;
    }
    context.results = "Updated " + result.changedRows + " rows.";
    res.render('home',context);
  });
});

///safe-update?id=1&name=The+Task&done=false
app.get('/safe-update',function(req,res,next){
  var context = {};
  mysql.pool.query("SELECT * FROM todo WHERE id=?", [req.query.id], function(err, result){
    if(err){
      next(err);
      return;
    }
    if(result.length == 1){
      var curVals = result[0];
      mysql.pool.query("UPDATE todo SET name=?, done=?, due=? WHERE id=? ",
        [req.query.name || curVals.name, req.query.done || curVals.done, req.query.due || curVals.due, req.query.id],
        function(err, result){
        if(err){
          next(err);
          return;
        }
        context.results = "Updated " + result.changedRows + " rows.";
        res.render('home',context);
      });
    }
  });
});

app.get('/reset-table',function(req,res,next){
  var context = {};
  mysql.pool.query("DROP TABLE IF EXISTS todo", function(err){
    var createString = "CREATE TABLE todo(" +
    "id INT PRIMARY KEY AUTO_INCREMENT," +
    "name VARCHAR(255) NOT NULL," +
    "done BOOLEAN," +
    "due DATE)";
    mysql.pool.query(createString, function(err){
      context.results = "Table reset";
      res.render('home',context);
    })
  });
});

app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});