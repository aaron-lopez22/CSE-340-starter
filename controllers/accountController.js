const utilities = require('../utilities');
const accountModel = require('../models/account-models');
const bcrypt = require("bcryptjs")

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav();
    res.render("account/login", {
        title: "Login",
        nav,
        errors: [],
        account_email: "",
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
    // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

    try {
        const regResult = await accountModel.accountRegister(
            account_firstname,
            account_lastname,
            account_email,
            hashedPassword
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

/* ****************************************
*  Process Login
* *************************************** */
async function loginAccount(req, res) {
    let nav = await utilities.getNav();
    const { account_email, account_password } = req.body;

    try {
        // Add your login logic here
        const loginResult = await accountModel.loginAccount(
            account_email,
            account_password
        );

        if (loginResult) {
            req.flash("notice", `Welcome back, ${loginResult.account_firstname}!`);
            return res.status(200).redirect("/account/dashboard");
        } else {
            req.flash("notice", "Login failed. Please check your email and password.");
            return res.status(401).render("account/login", {
                title: "Login",
                nav,
                errors: [{ msg: "Invalid email or password" }],
                account_email,
            });
        }
    } catch (error) {
        console.error('Controller Error:', error.message);
        req.flash("notice", `Login failed: ${error.message}`);
        return res.status(501).render("account/login", {
            title: "Login",
            nav,
            errors: [{ msg: `Login failed: ${error.message}` }],
            account_email,
        });
    }
}


module.exports = { buildLogin, buildRegister, registerAccount, loginAccount };