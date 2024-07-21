// utilities/authMiddleware.js
const jwt = require("jsonwebtoken");
require("dotenv").config();
const utilities = require("../utilities");

const authMiddleware = {};

/**
 * Middleware to verify JWT token and account type
 * Only allows access if account type is "Employee" or "Admin"
 */
authMiddleware.verifyEmployeeOrAdmin = async (req, res, next) => {
    const token = req.cookies.jwt;
    if (!token) {
        req.flash("notice", "Please log in.");
        return res.redirect("/account/login");
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (decoded.account_type === "Employee" || decoded.account_type === "Admin") {
            res.locals.accountData = decoded;
            res.locals.loggedin = true;
            next();
        } else {
            req.flash("notice", "Access restricted to employees and admins.");
            res.redirect("/account/login");
        }
    } catch (err) {
        req.flash("notice", "Invalid or expired token. Please log in again.");
        res.clearCookie("jwt");
        res.redirect("/account/login");
    }
};

module.exports = authMiddleware;