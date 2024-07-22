// utilities/authMiddleware.js
const jwt = require("jsonwebtoken");
require("dotenv").config();


const authMiddleware = {};
/**
 * Middleware to check if the user is logged in and has a valid JWT token.
 * If the user is not logged in, redirect them to the login page.
 */
authMiddleware.checkJWTToken = (req, res, next) => {
    if (req.cookies.jwt) {
        jwt.verify(
            req.cookies.jwt,
            process.env.ACCESS_TOKEN_SECRET,
            async (err, accountData) => {
                if (err) {
                    req.flash("notice", "Please log in");
                    res.clearCookie("jwt");
                    return res.redirect("/account/login");
                }
                res.locals.accountData = accountData;
                res.locals.loggedin = 1;
                next();
            }
        );
    } else {
        req.flash("notice", "Please log in");
        res.redirect("/account/login");
    }
};

/**
 * Middleware to check if the user has the appropriate account type to access
 * inventory management pages.
 * Only users with account type 'Employee' or 'Admin' are allowed access.
 */
authMiddleware.checkAccountType = (req, res, next) => {
    const { account_type } = res.locals.accountData;
    if (account_type === "Employee" || account_type === "Admin") {
        next();
    } else {
        req.flash("notice", "You do not have permission to access this page.");
        res.redirect("/account/login");
    }
};


module.exports = authMiddleware;