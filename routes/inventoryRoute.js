const express = require("express");
const router = express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities");
const authMiddleware = require("../utilities/auth-middleware"); // Update the file name here
const regValidate = require("../utilities/inventory-validation");

router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));
router.get("/details/:inventoryId", utilities.handleErrors(invController.buildByInventoryId));
router.get("/", utilities.handleErrors(invController.buildManagement));
router.get("/add-classification", authMiddleware.checkJWTToken, authMiddleware.checkAccountType, utilities.handleErrors(invController.buildAddClassification));
router.post("/add-classification", authMiddleware.checkJWTToken, authMiddleware.checkAccountType, regValidate.classificationRules(), regValidate.checkClassificationData, utilities.handleErrors(invController.addClassification));
router.get("/add-inventory", authMiddleware.checkJWTToken, authMiddleware.checkAccountType, utilities.handleErrors(invController.buildAddInventory));
router.post("/add-inventory", authMiddleware.checkJWTToken, authMiddleware.checkAccountType, regValidate.inventoryRules(), regValidate.checkInventoryData, utilities.handleErrors(invController.addInventory));
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));
router.get("/edit/:inventoryId", authMiddleware.checkJWTToken, authMiddleware.checkAccountType, utilities.handleErrors(invController.buildEditInventory));
router.post("/update", authMiddleware.checkJWTToken, authMiddleware.checkAccountType, regValidate.newInventoryRules(), regValidate.checkUpdateData, utilities.handleErrors(invController.updateInventory));
router.get("/delete/:inventoryId", authMiddleware.checkJWTToken, authMiddleware.checkAccountType, utilities.handleErrors(invController.buildDeleteInventoryView)); // Route to show delete confirmation view
router.post("/delete", authMiddleware.checkJWTToken, authMiddleware.checkAccountType, utilities.handleErrors(invController.deleteInventory)); // Route to handle the actual delete

module.exports = router;