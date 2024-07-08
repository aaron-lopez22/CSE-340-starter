const express = require("express");
const router = express.Router();
const invController = require("../controllers/invController");

router.get("/type/:classificationId", invController.buildByClassificationId);
router.get("/details/:inventoryId", invController.buildByInventoryId);

module.exports = router;