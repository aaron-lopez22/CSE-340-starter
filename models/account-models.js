const pool = require("../database/")

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
    try {
        const checkEmailSql = "SELECT * FROM account WHERE account_email = $1";
        const emailResult = await pool.query(checkEmailSql, [account_email]);
        
        if (emailResult.rowCount > 0) {
            throw new Error('Email already exists');
        }

        const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *";
        const result = await pool.query(sql, [account_firstname, account_lastname, account_email, account_password]);

        return result;
    } catch (error) {
        console.error('Database Error:', error.message); // Enhanced logging
        throw new Error(error.message);
    }
}

module.exports = { registerAccount };

