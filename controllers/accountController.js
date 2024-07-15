const utilities = require('../utilities');
const accountModel = require('../models/account-models');

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav();
    res.render("account/login", {
        title: "Login",
        nav,
    });
}


/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      title: "Register",
      nav,
      errors: null,
    })
  }

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav();
    const { account_firstname, account_lastname, account_email, account_password } = req.body;

    try {
        const regResult = await accountModel.registerAccount(
            account_firstname,
            account_lastname,
            account_email,
            account_password
        );

        if (regResult.rowCount > 0) {
            req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in.`);
            res.status(201).redirect("/account/login");
        }
    } catch (error) {
        console.error('Controller Error:', error.message); // Enhanced logging
        req.flash("notice", `Registration failed: ${error.message}`);
        res.status(501).render("account/register", {
            title: "Register",
            nav,
            message: `Registration failed: ${error.message}`,
            errors: null,
        });
    }
}

module.exports = { buildLogin, buildRegister, registerAccount };