const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  try {
    const data = await invModel.getInventoryByClassificationId(classification_id);
    if (!data || data.length === 0) {
      let nav = await utilities.getNav();
      return res.render("./inventory/classification", {
        title: "No vehicles found",
        nav,
        message: "No inventory items found for this classification.",
        grid: null,
      });
    }
    const grid = await utilities.buildClassificationGrid(data);
    let nav = await utilities.getNav();
    const className = data[0].classification_name;
    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
    });
  } catch (error) {
    console.error("Error building inventory by classification ID:", error);
    next(error);
  }
};

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
  const classificationSelect = await utilities.buildClassificationList();
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    errors:null,
    classificationSelect
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
      req.flash('success', 'New classification added successfully.');
      return res.redirect('/inv/');
    } else {
      req.flash('error', 'Failed to add new classification.');
      return res.redirect('/inv/add-classification');
    }
  } catch (error) {
    console.error("Error adding classification:", error);
    req.flash('error', 'An error occurred. Please try again.');
    return res.redirect('/inv/add-classification');
  }
};


invCont.buildAddInventory = async function (req, res, next) {
  let nav = await utilities.getNav();
  let classificationList = await utilities.buildClassificationList();
  res.render("inventory/add-inventory", {
    title: "Add New Inventory Item",
    nav,
    classificationList
  });
}

/* ***************************
 *  Add New Inventory Item
 * ************************** */
invCont.addInventory = async function (req, res, next) {
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_description,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    inv_image,
    inv_thumbnail
  } = req.body;

  console.log("Request Body:", req.body); // Log request body

  try {
    const result = await invModel.addInventory({
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      inv_image,
      inv_thumbnail
    });

    console.log("Result of addInventory:", result); // Log the result

    if (result) {
      let nav = await utilities.getNav();
      req.flash('success', 'New inventory item added successfully.');
      res.render("inventory/management", {
        title: "Inventory Management",
        nav,
        success: req.flash('success')
      });
    } else {
      throw new Error('Failed to add new inventory item.');
    }
  } catch (error) {
    console.error("Error adding inventory:", error);
    req.flash('error', 'An error occurred. Please try again.');
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList(classification_id);
    res.render('inventory/add-inventory', {
      title: "Add New Inventory Item",
      nav,
      classificationList,
      errors: req.flash('error'),
      locals: req.body
    });
  }
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build Edit Inventory View
 * ************************** */
invCont.buildEditInventory = async function (req, res, next) {
  const inv_id = parseInt(req.params.inventory_id); // Collect and store the incoming inventory_id as an integer
  try {
    let nav = await utilities.getNav();
    const itemData = await invModel.getInventoryByInvId(inv_id); // Get all the inventory item data based on the inventory_id
    if (itemData) {
      const classificationSelect = await utilities.buildClassificationList(itemData.classification_id);
      const itemName = `${itemData.inv_make} ${itemData.inv_model}`; // Create a "name" variable to hold the Make and Model of the inventory item
      res.render("./inventory/edit-inventory", {
        title: "Edit " + itemName, // Append the name variable into the "title" property
        nav,
        classificationSelect: classificationSelect,
        errors: null,
        inv_id: itemData.inv_id,
        inv_make: itemData.inv_make,
        inv_model: itemData.inv_model,
        inv_year: itemData.inv_year,
        inv_description: itemData.inv_description,
        inv_image: itemData.inv_image,
        inv_thumbnail: itemData.inv_thumbnail,
        inv_price: itemData.inv_price,
        inv_miles: itemData.inv_miles,
        inv_color: itemData.inv_color,
        classification_id: itemData.classification_id
      });
    } else {
      next(new Error("No inventory item found"));
    }
  } catch (error) {
    console.error("Error fetching inventory data:", error);
    res.status(500).json({ message: "Server error: Could not fetch inventory data" });
  }
};

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.buildEditInventory = async function (req, res, next) {
  const inv_id = parseInt(req.params.inventoryId); // Collect and store the incoming inventory_id as an integer
  try {
    let nav = await utilities.getNav();
    const itemData = await invModel.getInventoryByInvId(inv_id); // Get all the inventory item data based on the inventory_id
    if (itemData) {
      const classificationSelect = await utilities.buildClassificationList(itemData.classification_id);
      const itemName = `${itemData.inv_make} ${itemData.inv_model}`; // Create a "name" variable to hold the Make and Model of the inventory item
      res.render("./inventory/edit-inventory", {
        title: "Edit " + itemName, // Append the name variable into the "title" property
        nav,
        classificationSelect: classificationSelect,
        errors: null,
        inv_id: itemData.inv_id,
        inv_make: itemData.inv_make,
        inv_model: itemData.inv_model,
        inv_year: itemData.inv_year,
        inv_description: itemData.inv_description,
        inv_image: itemData.inv_image,
        inv_thumbnail: itemData.inv_thumbnail,
        inv_price: itemData.inv_price,
        inv_miles: itemData.inv_miles,
        inv_color: itemData.inv_color,
        classification_id: itemData.classification_id
      });
    } else {
      next(new Error("No inventory item found"));
    }
  } catch (error) {
    console.error("Error fetching inventory data:", error);
    res.status(500).json({ message: "Server error: Could not fetch inventory data" });
  }
};



/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  console.log("Update Inventory Request Body:", req.body); // Add this line for logging
  let nav = await utilities.getNav();
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body;

  try {
    const updateResult = await invModel.updateInventory(
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id
    );

    console.log("Update Result:", updateResult); // Add this line for logging

    if (updateResult) {
      const itemName = `${updateResult.inv_make} ${updateResult.inv_model}`;
      req.flash("notice", `The ${itemName} was successfully updated.`);
      res.redirect("/inv/");
    } else {
      const classificationSelect = await utilities.buildClassificationList(classification_id);
      const itemName = `${inv_make} ${inv_model}`;
      req.flash("notice", "Sorry, the update failed.");
      res.status(501).render("inventory/edit-inventory", {
        title: "Edit " + itemName,
        nav,
        classificationSelect: classificationSelect,
        errors: null,
        inv_id,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classification_id
      });
    }
  } catch (error) {
    console.error("Error updating inventory item:", error);
    req.flash("notice", "An error occurred. Please try again.");
    res.redirect(`/inv/edit/${inv_id}`);
  }
};

/* ***************************
 *  Build Delete Confirmation View
 * ************************** */
invCont.buildDeleteInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inventoryId);
  try {
    let nav = await utilities.getNav();
    const itemData = await invModel.getInventoryByInvId(inv_id);
    if (itemData) {
      const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
      res.render("./inventory/delete-confirm", {
        title: "Delete " + itemName,
        nav,
        errors: null,
        inv_id: itemData.inv_id,
        inv_make: itemData.inv_make,
        inv_model: itemData.inv_model,
        inv_year: itemData.inv_year,
        inv_price: itemData.inv_price
      });
    } else {
      next(new Error("No inventory item found"));
    }
  } catch (error) {
    console.error("Error fetching inventory data:", error);
    res.status(500).json({ message: "Server error: Could not fetch inventory data" });
  }
};

/* ***************************
 *  Delete Inventory Data
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
  const inv_id = parseInt(req.body.inv_id);
  try {
    const deleteResult = await invModel.deleteInventoryItem(inv_id);
    if (deleteResult.rowCount) {
      req.flash("notice", "The inventory item was successfully deleted.");
      res.redirect("/inv/");
    } else {
      req.flash("notice", "Sorry, the delete failed.");
      res.redirect(`/inv/delete/${inv_id}`);
    }
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    req.flash("notice", "An error occurred. Please try again.");
    res.redirect(`/inv/delete/${inv_id}`);
  }
};



invCont.searchInventory = async function (req, res, next) {
  const { query } = req.body;
  try {
    const data = await invModel.searchInventory(query);
    let nav = await utilities.getNav();
    if (data.length === 0) {
      return res.render("inventory/search-results", {
        title: "Search Results",
        nav,
        message: "No inventory items found matching your criteria.",
        results: []
      });
    }
    res.render("inventory/search-results", {
      title: "Search Results",
      nav,
      message: null, // Ensure message is defined
      results: data
    });
  } catch (error) {
    console.error("Error searching inventory:", error);
    next(error);
  }
};


// Method to render the search page
invCont.buildSearchPage = async function (req, res, next) {
  let nav = await utilities.getNav();
  res.render("inventory/search", {
    title: "Search Inventory",
    nav,
    message: null
  });
};

module.exports = invCont;