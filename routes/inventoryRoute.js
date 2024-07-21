const express = require("express");
const router = express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities");
const regValidate = require("../utilities/inventory-validation");

router.get("/type/:classificationId", invController.buildByClassificationId);
router.get("/details/:inventoryId", invController.buildByInventoryId);
router.get("/", utilities.handleErrors(invController.buildManagement));
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification));
router.post("/add-classification", regValidate.classificationRules(), regValidate.checkClassificationData, utilities.handleErrors(invController.addClassification));
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory));
router.post("/add-inventory", regValidate.inventoryRules(), regValidate.checkInventoryData, utilities.handleErrors(invController.addInventory));

router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))
router.get("/edit/:inventoryId", utilities.handleErrors(invController.buildEditInventory));
router.post(
    "/update",
    regValidate.newInventoryRules(),
    regValidate.checkUpdateData,
    utilities.handleErrors(invController.updateInventory)
  );
  
module.exports = router;