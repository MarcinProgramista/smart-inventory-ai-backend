import { db } from "../db.js";

/* ============================
   GET ALL CATEGORIES FOR USER
============================ */
export const getCategories = async (req, res) => {
  const userId = parseInt(req.query.user_id);

  if (!userId) return res.status(400).json({ error: "user_id is required" });

  try {
    const result = await db.query(
      "SELECT * FROM categories WHERE user_id = $1 ORDER BY id",
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("getCategories error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ============================
   ADD CATEGORY
============================ */
export const addCategory = async (req, res) => {
  const { user_id, name } = req.body;

  if (!user_id || !name)
    return res.status(400).json({ error: "user_id and name required" });

  try {
    const result = await db.query(
      "INSERT INTO categories (user_id, name) VALUES ($1, $2) RETURNING *",
      [user_id, name]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("addCategory error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ============================
   UPDATE CATEGORY
============================ */
export const updateCategory = async (req, res) => {
  const { id, name } = req.body;

  if (!id || !name)
    return res.status(400).json({ error: "id and name required" });

  try {
    const result = await db.query(
      "UPDATE categories SET name = $1 WHERE id = $2 RETURNING *",
      [name, id]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ error: "Category not found" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("updateCategory error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ============================
   DELETE CATEGORY
============================ */
export const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      "DELETE FROM categories WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ error: "Category not found" });

    res.json({ success: true, deleted: result.rows[0] });
  } catch (err) {
    console.error("deleteCategory error:", err);
    res.status(500).json({ error: err.message });
  }
};
