import { db } from "../db.js";

/* =============
    Ger all suppliers
================*/
export const getSuppliers = async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: "user_id required" });
  try {
    const result = await db.query(
      "SELECT * FROM suppliers WHERE user_id = $1 ORDER BY name ASC",
      [user_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.log("getSuppliers error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * ADD SUPPLIER
 */
export const addSupplier = async (req, res) => {
  const { user_id, name, contact, phone, email, address } = req.body;

  if (!user_id || !name)
    return res.satus(400).json({ error: "user_id and name required" });
  try {
    const result = await db.query(
      `INSERT  INTO suppliers (user_id, name, contact, phone, email, address) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [user_id, name, contact, phone, email, address]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.log("addSupplier error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * UPDATE SUPPLIER
 */
export const updateSupplier = async (req, res) => {
  const { id, name, contact, phone, email, address } = req.body;
  if (!id || !name)
    return res.status(400).json({ error: "id and name required" });
  try {
    const result = await db.query(
      "UPDATE suppliers SET name =$1, contact=$2, phone=$3,email=$4, address=$5 WHERE id = $6 RETURNING *",
      [name, contact, phone, email, address, id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ error: "Supplier not found" });
    res.json(result.rows[0]);
  } catch (error) {
    console.error("updateSupplier error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * DELETE SUPPLIER
 */
export const deleteSupplier = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      "DELETE FROM suppliers WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ error: "Supplier not found" });
    res.json({ success: true, deleted: result.rows[0] });
  } catch (error) {
    console.log("deleteSupplier error:", error);
    res.status(500).json({ error: error.message });
  }
};
