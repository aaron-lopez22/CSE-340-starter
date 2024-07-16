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

async function addInventory(inventoryData) {
  try {
    const sql = `
      INSERT INTO public.inventory (classification_id, inv_make, inv_model, inv_description, inv_price, inv_year, inv_miles, inv_color, inv_image, inv_thumbnail) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`;
    const result = await pool.query(sql, [
      inventoryData.classification_id,
      inventoryData.inv_make,
      inventoryData.inv_model,
      inventoryData.inv_description,
      inventoryData.inv_price,
      inventoryData.inv_year,
      inventoryData.inv_miles,
      inventoryData.inv_color,
      inventoryData.inv_image,
      inventoryData.inv_thumbnail
    ]);
    return result.rows[0];
  } catch (error) {
    console.error("addInventory error " + error);
    return null;
  }
}

module.exports = {getClassifications, getInventoryByClassificationId, getInventoryByInvId, addClassification, addInventory};