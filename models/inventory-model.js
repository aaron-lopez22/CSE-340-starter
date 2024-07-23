const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

async function getInventoryByInvId(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory WHERE inv_id = $1`,
      [inv_id]
    )
    return data.rows[0]
  } catch (error) {
    console.error("getinventorybyid error " + error)
  }
}

async function addClassification(classification_name) {
  try {
    const sql = "INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *";
    const result = await pool.query(sql, [classification_name]);
    return result.rows[0];
  } catch (error) {
    console.error("addClassification error " + error);
    return null;
  }
}
/* ***************************
 *  Add New Inventory Item
 * ************************** */
async function addInventory(inventoryData) {
  const sql = `
    INSERT INTO public.inventory (
      classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`;
  
  const params = [
    inventoryData.classification_id,
    inventoryData.inv_make,
    inventoryData.inv_model,
    inventoryData.inv_year,
    inventoryData.inv_description,
    inventoryData.inv_image,
    inventoryData.inv_thumbnail,
    inventoryData.inv_price,
    inventoryData.inv_miles,
    inventoryData.inv_color
  ];

  console.log("Executing SQL:", sql); // Log SQL query
  console.log("With parameters:", params); // Log parameters

  try {
    const result = await pool.query(sql, params);
    console.log("Query result:", result); // Log query result
    return result.rows[0];
  } catch (error) {
    console.error("addInventory error:", error);
    throw error;
  }
}




/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
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
) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *"
    const data = await pool.query(sql, [
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
      inv_id
    ])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
    throw new Error("Update failed")
  }
}


/* ***************************
 *  Delete Inventory Item
 * ************************** */
async function deleteInventoryItem(inv_id) {
  try {
    const sql = 'DELETE FROM public.inventory WHERE inv_id = $1';
    const data = await pool.query(sql, [inv_id]);
    return data;
  } catch (error) {
    console.error("Delete Inventory Error:", error);
    throw new Error("Delete Inventory Error");
  }
}

/* ***************************
 *  Search inventory items
 * ************************** */
async function searchInventory(query) {
  try {
    const sqlQuery = `
      SELECT i.*, c.classification_name 
      FROM public.inventory i
      JOIN public.classification c ON i.classification_id = c.classification_id
      WHERE i.inv_make ILIKE $1
      OR i.inv_model ILIKE $1
      OR i.inv_year::text ILIKE $1
      OR c.classification_name ILIKE $1`;
    const values = [`%${query}%`];
    const data = await pool.query(sqlQuery, values);
    return data.rows;
  } catch (error) {
    console.error("searchInventory error " + error);
    throw new Error("Search failed");
  }
}

module.exports = {getClassifications, getInventoryByClassificationId, getInventoryByInvId, addClassification, addInventory, updateInventory, deleteInventoryItem, searchInventory};