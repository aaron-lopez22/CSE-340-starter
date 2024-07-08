const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build car detail view by inventory_id
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
  const inv_id = req.params.inventoryId; // Note: Correct parameter name
  console.log("Invoked buildByInventoryId with inv_id:", inv_id); // Add this line
  try {
    const data = await invModel.getInventoryByInvId(inv_id);
    console.log("Vehicle Data:", data);
    if (!data) {
      throw new Error("Vehicle not found");
    }
    const vehicleHtml = await utilities.buildVehicleHtml(data);
    let nav = await utilities.getNav();
    const vehicleName = `${data.inv_make} ${data.inv_model}`;
    res.render("./inventory/details", {
      title: vehicleName,
      nav,
      vehicleHtml,
    });
  } catch (error) {
    console.error("Error building inventory by ID:", error);
    next(error);
  }
};

module.exports = invCont