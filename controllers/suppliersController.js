import { db } from "../db.js";
import { normalizeSupplierPayload } from "../utils/validators/normalizeSupplier.js";
import { validateSupplier } from "../utils/validators/validateSupplier.js";

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
  try {
    const payload = normalizeSupplierPayload(req.body);
    const errors = validateSupplier(payload);

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const { user_id, name, contact_id, street, postal_code, city, country } =
      payload;

    const result = await db.query(
      `
      INSERT INTO suppliers (
        user_id, name, contact_id, street, postal_code, city, country
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
      [user_id, name, contact_id, street, postal_code, city, country]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.log("addSupplier error:", error);

    if (error.code === "23505") {
      return res
        .status(400)
        .json({ error: "Supplier name already exists for this user" });
    }

    if (error.code === "23503") {
      return res
        .status(400)
        .json({ error: "Referenced contact_id does not exist" });
    }

    return res.status(500).json({ error: error.message });
  }
};

/**
 * UPDATE SUPPLIER
 */
export const updateSupplier = async (req, res) => {
  try {
    const payload = normalizeSupplierPayload(req.body);
    const { id } = req.params;
    const errors = validateSupplier(payload, { isUpdate: true });
    if (errors.lenght > 0) {
      return res.status(400).json({ errors });
    }
    const { name, contact_id, street, postal_code, city, country } = payload;
    const result = await db.query(
      `
      UPDATE suppliers
      SET 
        name = $1,
        contact_id = $2,
        street = $3,
        postal_code = $4,
        city = $5,
        country = $6
      WHERE id = $7
      RETURNING *
      `,
      [name, contact_id, street, postal_code, city, country, id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ error: "Supplier not found" });
    }
    return res.json({
      updated: true,
      supplier: result.rows[0],
    });
  } catch (error) {
    console.log("uppdateSupplier error:", error);
    if (error.code === "23505") {
      return res
        .status(400)
        .json({ error: "Supplier name already exists for this user" });
    }
    if (error.code === "23503") {
      return res
        .status(400)
        .json({ error: "Referenced contact_id does not exist" });
    }
    return res.status(500).json({ error: error.message });
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
