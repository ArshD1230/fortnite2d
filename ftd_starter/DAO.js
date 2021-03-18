const { Pool } = require('pg')
const pool = new Pool({
    user: 'webdbuser',
    host: 'localhost',
    database: 'webdb',
    password: 'password',
    port: 5432
});

module.exports = {
    createUser: function(username, password, birthday, skill) {
        let sql = 'INSERT INTO ftduser(username, password, birthday, skill) VALUES ($1, sha512($2), $3, $4)';
	    pool.query(sql, [username, password, birthday, skill], (err, pgRes) => {
            if (err) {
                console.log(err.stack);
            }
	    });
    },
    getUser: function(username, callback) {
        let sql = 'SELECT birthday, skill FROM ftduser where username=$1';
        pool.query(sql, [username], (err, pgRes) => {
            if (err) {
                callback(error);
                console.log(stack);
            } else if (pgRes.rowCount == 0) {
                callback(0, 'na');
            } else {
                //console.log(pgRes.rows);
                var user = {
                    "birthday" : "",
                    "skill": ""
                };
                user["birthday"] = pgRes.rows[0]['birthday'];
                user["skill"] = pgRes.rows[0]['skill'];
                //console.log(user);
                callback(0, user);  
            }
        });
    },
    updateUser: function(newUsername, oldUsername, password, birthday, skill) {
        let sql = 'UPDATE ftduser SET birthday=$1, skill=$2, username=$3 where username = $4';
        pool.query(sql, [birthday, skill, newUsername, oldUsername], (err, pgRes) => {
            if (err) {
                console.log(stack);
            }
        });
        if (password != "") {
            sql = 'UPDATE ftduser SET password=sha512($1) where username=$2';
            pool.query(sql, [password, newUsername], (err, pgRes) => {
                if (err) {
                    console.log(stack);
                }
            })
        }
    }
}