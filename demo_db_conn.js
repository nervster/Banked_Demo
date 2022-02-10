
var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs361_shethn',
  password        : '8578',
  database        : 'cs361_shethn'
});

// pool.getConnection()

// var connection = mysql.createConnection({
//   host            : 'mysql.engr.oregonstate.edu',
//   user            : 'cs361_shethn',
//   password        : '8578',
//   database        : 'cs361_shethn',
//   port: 3000
// });

module.exports.pool = pool;