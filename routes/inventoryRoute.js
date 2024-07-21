const express = require("express");
const router = express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities");
const authMiddleware = require("../utilities/authMiddleware");
const regValidate = require("../utilities/inventory-validation");

router.get("/type/:classificationId", invController.buildByClassificationId);
router.get("/details/:inventoryId", invController.buildByInventoryId);

router.get("/", utilities.handleErrors(invController.buildManagement));
router.get("/add-classification", authMiddleware.verifyEmployeeOrAdmin, utilities.handleErrors(invController.buildAddClassification));
router.post("/add-classification", authMiddleware.verifyEmployeeOrAdmin, regValidate.classificationRules(), regValidate.checkClassificationData, utilities.handleErrors(invController.addClassification));
router.get("/add-inventory", authMiddleware.verifyEmployeeOrAdmin, utilities.handleErrors(invController.buildAddInventory));
router.post("/add-inventory", authMiddleware.verifyEmployeeOrAdmin, regValidate.inventoryRules(), regValidate.checkInventoryData, utilities.handleErrors(invController.addInventory));
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));

router.get("/edit/:inventoryId", authMiddleware.verifyEmployeeOrAdmin, utilities.handleErrors(invController.buildEditInventory));
router.post("/update", authMiddleware.verifyEmployeeOrAdmin, regValidate.newInventoryRules(), regValidate.checkUpdateData, utilities.handleErrors(invController.updateInventory));

router.get("/delete/:inventoryId", authMiddleware.verifyEmployeeOrAdmin, utilities.handleErrors(invController.buildDeleteInventoryView)); // Route to show delete confirmation view
router.post("/delete", authMiddleware.verifyEmployeeOrAdmin, utilities.handleErrors(invController.deleteInventory)); // Route to handle the actual delete

module.exports = router;