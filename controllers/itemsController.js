// controllers/itemsController.js
import { db } from "../db.js";
import { validateItem } from "../utils/validators/itemValidator.js";
/* ------------------------------
   GET ALL ITEMS
------------------------------ */
export const getAllItems = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.user_id;

    if (!userId) {
      return res.status(400).json({ error: "Missing user_id" });
    }

    const query = `
      SELECT 
        i.id,
        i.user_id,
        i.category_id,
        i.name,
        i.quantity,
        i.min_quantity,
        i.price,
        i.description,
        i.created_at,
        i.supplier_id,

        s.name AS supplier_name,
        s.contact AS supplier_contact,
        s.phone AS supplier_phone,
        s.email AS supplier_email,
        s.address AS supplier_address

      FROM items i
      LEFT JOIN suppliers s ON s.id = i.supplier_id
      WHERE i.user_id = $1
      ORDER BY i.created_at DESC;
    `;

    const result = await db.query(query, [userId]);

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
      ADD OR UPDATE ITEM
------------------------------ */

export const addItem = async (req, res) => {
  const errors = validateItem(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const {
    user_id,
    category_id,
    name,
    quantity,
    min_quantity,
    supplier_id,
    price,
    description,
  } = req.body;

  const qty = Number(quantity);

  try {
    const result = await db.query(
      `
      INSERT INTO items
        (user_id, category_id, name, quantity, min_quantity, supplier_id, price, description)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (name, supplier_id, user_id)
      DO UPDATE SET quantity = items.quantity + EXCLUDED.quantity
      RETURNING *, (xmax = 0) AS created;
      `,
      [
        user_id,
        category_id,
        name.trim(),
        qty,
        min_quantity,
        supplier_id,
        price,
        description || null,
      ]
    );

    const item = result.rows[0];

    return item.created
      ? res.status(201).json({
          created: true,
          item,
          message: "Item created",
        })
      : res.status(200).json({
          updated: true,
          item,
          message: "Item existed — quantity increased",
        });
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

  // Normalizacja danych wejściowych
  const payload = {
    ...req.body,
    name: req.body.name,
    quantity: Number(req.body.quantity),
    min_quantity: Number(req.body.min_quantity),
    price: Number(req.body.price),
    supplier_id: Number(req.body.supplier_id),
    category_id: Number(req.body.category_id),
    user_id: Number(req.body.user_id), // opcjonalnie jeśli przesyłasz
  };

  // --- VALIDATION --- //
  const errors = validateItem(payload);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const result = await db.query(
      `
      UPDATE items
      SET 
        name = $1,
        quantity = $2,
        min_quantity = $3,
        supplier_id = $4,
        price = $5,
        description = $6,
        category_id = $7
      WHERE id = $8
      RETURNING *
      `,
      [
        payload.name.trim(),
        payload.quantity,
        payload.min_quantity,
        payload.supplier_id,
        payload.price,
        payload.description || null,
        payload.category_id || null,
        id,
      ]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "Item not found" });
    }

    return res.json({
      updated: true,
      item: result.rows[0],
      message: "Item updated successfully",
    });
  } catch (error) {
    console.error("updateItem error:", error);
    return res.status(500).json({ error: error.message });
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
