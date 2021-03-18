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
    }
}