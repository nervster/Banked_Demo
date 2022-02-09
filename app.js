const express = require('express');
const mysql = require('./demo_db_conn.js');
const path = require('path');
const ejsMate = require('ejs-mate');
const bodyParser = require("body-parser");
// var handlebars = require('express-handlebars').create({defaultLayout:'main'});
// app.engine('handlebars', handlebars.engine);
// app.set('view engine', 'handlebars');
const app = express();

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
//   mysql.pool.query('SELECT * FROM todo', function(err, rows, fields){
//     if(err){
//       next(err);
//       return;
//     }
    // context.results = JSON.stringify(rows);
    res.render('home', context);
  });
// });

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
    //   mysql.pool.query('SELECT * FROM todo', function(err, rows, fields){
    //     if(err){
    //       next(err);
    //       return;
    //     }
        // context.results = JSON.stringify(rows);
        res.render('budget', context);
    });

app.post('/budget',function(req,res,next){
    var context = {};
    //   mysql.pool.query('SELECT * FROM todo', function(err, rows, fields){
    //     if(err){
    //       next(err);
    //       return;
    //     }
        // context.results = JSON.stringify(rows);
        console.log(req.body);
        daily_allowance = req.body.monthly_income - req.body.monthly_housing - req.body.monthly_car - req.body.monthly_subscriptions - req.body.monthly_other
        context.daily_allowance = daily_allowance / getDaysInCurrentMonth()
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