const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities");
const regValidate = require("../utilities/account-validation");

router.get("/login", utilities.handleErrors(accountController.buildLogin));
router.post(
    "/login",
    regValidate.loginRules(),
    regValidate.checkLoginData,
    utilities.handleErrors(accountController.accountLogin)
);
router.get("/", utilities.handleErrors(accountController.buildAccountManagement));
router.get("/register", utilities.handleErrors(accountController.buildRegister));

// Process the registration data
router.post(
    "/register",
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
);

// Add the logout route
router.get("/logout", accountController.logoutAccount);

// Add the update account route
router.get("/update/:accountId", utilities.handleErrors(accountController.buildUpdateAccount));

router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagement));

module.exports = router;