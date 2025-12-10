// controllers/itemsController.js
import { db } from "../db.js";

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

  // --- VALIDATION --- //
  if (!user_id) return res.status(400).json({ error: "Missing user_id" });

  if (!name || typeof name !== "string" || name.trim().length < 2)
    return res.status(400).json({ error: "Invalid item name" });

  if (quantity === undefined || isNaN(Number(quantity)) || Number(quantity) < 0)
    return res
      .status(400)
      .json({ error: "Quantity must be a non-negative number" });

  if (
    min_quantity === undefined ||
    isNaN(Number(min_quantity)) ||
    Number(min_quantity) < 0
  )
    return res
      .status(400)
      .json({ error: "Min quantity must be a non-negative number" });

  if (!supplier_id || isNaN(Number(supplier_id)))
    return res.status(400).json({ error: "Invalid supplier_id" });

  if (price === undefined || isNaN(Number(price)) || Number(price) < 0)
    return res.status(400).json({ error: "Price must be a positive number" });

  if (description && typeof description !== "string")
    return res.status(400).json({ error: "Description must be a string" });

  if (category_id && isNaN(Number(category_id)))
    return res.status(400).json({ error: "Invalid category_id" });

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

    if (item.created) {
      return res.status(201).json({
        created: true,
        item,
        message: "Item created",
      });
    } else {
      return res.status(200).json({
        updated: true,
        item,
        message: "Item existed — quantity increased",
      });
    }
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
