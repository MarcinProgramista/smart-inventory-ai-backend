// controllers/itemsController.js
import { db } from "../db.js";

/* ------------------------------
   GET ALL ITEMS
------------------------------ */
export const getAllItems = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM items ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("getAllItems error:", error);
    res.status(500).json({ error: error.message });
  }
};

/* ------------------------------
   SEARCH ITEMS
   GET /api/items/search?q=term
------------------------------ */
export const searchItems = async (req, res) => {
  const q = req.query.q;

  if (!q || q.trim() === "") {
    return res.json([]);
  }

  try {
    const result = await db.query(
      `
      SELECT *
      FROM items
      WHERE LOWER(name) LIKE LOWER($1)
         OR LOWER(supplier) LIKE LOWER($1)
         OR LOWER(description) LIKE LOWER($1)
      ORDER BY name ASC
      `,
      [`%${q}%`]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("searchItems error:", error);
    res.status(500).json({ error: error.message });
  }
};

/* ------------------------------
   ADD ITEM
------------------------------ */
export const addItem = async (req, res) => {
  const {
    user_id,
    category_id,
    name,
    quantity,
    min_quantity,
    supplier,
    price,
    description,
  } = req.body;

  try {
    const result = await db.query(
      `
      INSERT INTO items 
      (user_id, category_id, name, quantity, min_quantity, supplier, price, description)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *
      `,
      [
        user_id,
        category_id,
        name,
        quantity,
        min_quantity,
        supplier,
        price,
        description,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("addItem error:", error);
    res.status(500).json({ error: error.message });
  }
};

/* ------------------------------
   UPDATE ITEM
------------------------------ */
export const updateItem = async (req, res) => {
  const { id } = req.params;

  const { name, quantity, min_quantity, supplier, price, description } =
    req.body;

  try {
    const result = await db.query(
      `
      UPDATE items
      SET name=$1, quantity=$2, min_quantity=$3, supplier=$4, price=$5, description=$6
      WHERE id=$7
      RETURNING *
      `,
      [name, quantity, min_quantity, supplier, price, description, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("updateItem error:", error);
    res.status(500).json({ error: error.message });
  }
};

/* ------------------------------
   DELETE ITEM
------------------------------ */
export const deleteItem = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query("DELETE FROM items WHERE id=$1", [id]);
    res.json({ message: `Item ${id} deleted`, success: true });
  } catch (error) {
    console.error("deleteItem error:", error);
    res.status(500).json({ error: error.message });
  }
};
