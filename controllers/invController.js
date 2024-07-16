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

invCont.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav();
  res.render("inventory/management", {
    title: "Inventory Management",
    nav
  });
}


invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav();
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav
  });
}

invCont.addClassification = async function (req, res, next) {
  const { classification_name } = req.body;
  try {
    const result = await invModel.addClassification(classification_name);
    if (result) {
      let nav = await utilities.getNav();
      req.flash('success', 'New classification added successfully.');
      res.render("inventory/management", {
        title: "Inventory Management",
        nav,
        success: req.flash('success')
      });
    } else {
      req.flash('error', 'Failed to add new classification.');
      res.redirect('/inv/add-classification');
    }
  } catch (error) {
    req.flash('error', 'An error occurred. Please try again.');
    res.redirect('/inv/add-classification');
  }
}


invCont.buildAddInventory = async function (req, res, next) {
  let nav = await utilities.getNav();
  let classificationList = await utilities.buildClassificationList();
  res.render("inventory/add-inventory", {
    title: "Add New Inventory Item",
    nav,
    classificationList
  });
}

invCont.addInventory = async function (req, res, next) {
  const { classification_id, inv_make, inv_model, inv_description, inv_price, inv_year, inv_miles, inv_color, inv_image, inv_thumbnail } = req.body;
  try {
    const result = await invModel.addInventory({ classification_id, inv_make, inv_model, inv_description, inv_price, inv_year, inv_miles, inv_color, inv_image, inv_thumbnail });
    if (result) {
      let nav = await utilities.getNav();
      req.flash('success', 'New inventory item added successfully.');
      res.render("inventory/management", {
        title: "Inventory Management",
        nav,
        success: req.flash('success')
      });
    } else {
      req.flash('error', 'Failed to add new inventory item.');
      res.redirect('/inv/add-inventory');
    }
  } catch (error) {
    req.flash('error', 'An error occurred. Please try again.');
    res.redirect('/inv/add-inventory');
  }
}
module.exports = invCont;