
var mysql = require('mysql');
const fs = require('fs');


// var pool = mysql.createPool({
//   connectionLimit : 10,
//   host            : 'classmysql.engr.oregonstate.edu',
//   user            : 'cs361_shethn',
//   password        : '8578',
//   database        : 'cs361_shethn'
// });

var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'piggybankdb.mysql.database.azure.com',
  user            : 'npsheth978@piggybankdb',
  password        : 'Nervster!1993',
  database        : 'pb',
  port            : 3306,
  // ssl             : {ca:fs.readFileSync({ca-cert filename})
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