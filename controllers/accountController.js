const utilities = require('../utilities');
const accountModel = require('../models/account-models');
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()


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
  let hashedPassword;
  try {
      // regular password and cost (salt is generated automatically)
      hashedPassword = await bcrypt.hashSync(account_password, 10);
  } catch (error) {
      req.flash("notice", 'Sorry, there was an error processing the registration.');
      res.status(500).render("account/register", {
          title: "Registration",
          nav,
          errors: null,
      });
  }

  try {
      const regResult = await accountModel.registerAccount(
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
*  Process login request
* ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
   req.flash("notice", "Please check your credentials and try again.")
   res.status(400).render("account/login", {
    title: "Login",
    nav,
    errors: null,
    account_email,
   })
  return
  }
  try {
   if (await bcrypt.compare(account_password, accountData.account_password)) {
   delete accountData.account_password
   const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })
   if(process.env.NODE_ENV === 'development') {
     res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
     } else {
       res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
     }
   return res.redirect("/account/")
   }
  } catch (error) {
    req.flash("notice", "Access Forbidden")
    return res.redirect("/account/login")
  }
 }

async function buildAccountManagement (req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/accountManagement", {
    title: "Account Management",
    nav,
    success: req.flash('success'),
    error: req.flash('error')
  });
}

/* ****************************************
*  Deliver update account view
* *************************************** */
async function buildUpdateAccount(req, res, next) {
  let nav = await utilities.getNav();
  const accountId = req.params.accountId;
  const accountData = await accountModel.getAccountById(accountId); // Assuming this method exists in accountModel
  if (!accountData) {
      req.flash("notice", "Account not found.");
      return res.redirect("/account");
  }
  res.render("account/updateAccount", {
      title: "Update Account Information",
      nav,
      errors: [],
      accountData
  });
}

  /* ****************************************
*  Process logout request
* *************************************** */
async function logoutAccount(req, res) {
  res.clearCookie("jwt");
  req.flash("notice", "You have been logged out.");
  res.redirect("/account/login");
}




/* ****************************************
 *  Deliver update account view
 * *************************************** */
async function buildUpdateAccount(req, res, next) {
  let nav = await utilities.getNav();
  const accountData = await accountModel.getAccountById(req.params.accountId);
  res.render("account/updateAccount", {
      title: "Update Account Information",
      nav,
      errors: [],
      message: req.flash('message'),
      accountData,
  });
}

/* ****************************************
*  Process account update
* *************************************** */
async function updateAccount(req, res, next) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email } = req.body;
  const accountId = req.params.accountId;

  try {
      const updateResult = await accountModel.updateAccount(accountId, account_firstname, account_lastname, account_email);

      if (updateResult) {
          req.flash('success', 'Account updated successfully.');
          res.redirect(`/account/`);
      } else {
          req.flash('error', 'Account update failed.');
          res.status(500).render("account/updateAccount", {
              title: "Update Account Information",
              nav,
              errors: [],
              message: req.flash('error'),
              accountData: { account_id: accountId, account_firstname, account_lastname, account_email },
          });
      }
  } catch (error) {
      console.error('Error updating account:', error);
      req.flash('error', 'An error occurred. Please try again.');
      res.status(500).render("account/updateAccount", {
          title: "Update Account Information",
          nav,
          errors: [],
          message: req.flash('error'),
          accountData: { account_id: accountId, account_firstname, account_lastname, account_email },
      });
  }
}

/* ****************************************
*  Process password change
* *************************************** */
async function changePassword(req, res, next) {
  let nav = await utilities.getNav();
  const { current_password, new_password, confirm_new_password } = req.body;
  const accountId = req.params.accountId;

  try {
      const accountData = await accountModel.getAccountById(accountId);

      if (await bcrypt.compare(current_password, accountData.account_password)) {
          if (new_password === confirm_new_password) {
              const hashedPassword = await bcrypt.hash(new_password, 10);
              const updateResult = await accountModel.updatePassword(accountId, hashedPassword);

              if (updateResult) {
                  req.flash('success', 'Password changed successfully.');
                  res.redirect(`/account/`);
              } else {
                  req.flash('error', 'Password change failed.');
                  res.status(500).render("account/updateAccount", {
                      title: "Update Account Information",
                      nav,
                      errors: [],
                      message: req.flash('error'),
                      accountData,
                  });
              }
          } else {
              req.flash('error', 'New passwords do not match.');
              res.status(400).render("account/updateAccount", {
                  title: "Update Account Information",
                  nav,
                  errors: [],
                  message: req.flash('error'),
                  accountData,
              });
          }
      } else {
          req.flash('error', 'Current password is incorrect.');
          res.status(400).render("account/updateAccount", {
              title: "Update Account Information",
              nav,
              errors: [],
              message: req.flash('error'),
              accountData,
          });
      }
  } catch (error) {
      console.error('Error changing password:', error);
      req.flash('error', 'An error occurred. Please try again.');
      res.status(500).render("account/updateAccount", {
          title: "Update Account Information",
          nav,
          errors: [],
          message: req.flash('error'),
          accountData,
      });
  }
}

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManagement, logoutAccount, buildUpdateAccount, updateAccount, changePassword };