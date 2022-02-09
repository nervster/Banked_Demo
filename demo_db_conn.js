
var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'mysql.engr.oregonstate.edu',
  user            : 'cs361_shethn',
  password        : '8578',
  database        : 'cs361_shethn'
});

module.exports.pool = pool;