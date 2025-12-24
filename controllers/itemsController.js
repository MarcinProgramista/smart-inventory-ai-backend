// controllers/itemsController.js
import { db } from "../db.js";
import { validateItem } from "../utils/validators/itemValidator.js";
import { normalizeItemPayload } from "../utils/validators/normalizeItem.js";

/* ------------------------------
    GET ALL ITEMS
  ------------------------------ */
export const getAllItems = async (req, res) => {
  try {
    const userId = Number(req.user?.id || req.query.user_id);

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

        c.first_name  AS contact_first_name,
        c.last_name   AS contact_last_name,
        c.mobile_phone AS contact_phone,
        c.email       AS contact_email

      FROM items i
      LEFT JOIN suppliers s ON s.id = i.supplier_id
      LEFT JOIN contacts c ON c.id = s.contact_id
      WHERE i.user_id = $1
      ORDER BY i.created_at DESC;
    `;

    const { rows } = await db.query(query, [userId]);
    return res.json(rows);
  } catch (error) {
    console.error("getAllItems error:", error);
    return res.status(500).json({ error: "Failed to fetch items" });
  }
};

/* ------------------------------
    SEARCH ITEMS
  ------------------------------ */
export const searchItems = async (req, res) => {
  const q = req.query.q;

  if (!q || q.trim() === "") return res.json([]);

  try {
    const result = await db.query(
      `
        SELECT *
        FROM items
        WHERE LOWER(name) LIKE LOWER($1)
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
    ADD ITEM (OR INCREASE QUANTITY)
  ------------------------------ */

export const addItem = async (req, res) => {
  const payload = normalizeItemPayload(req.body);

  const errors = validateItem(payload);
  if (errors.length > 0) return res.status(400).json({ errors });

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
        payload.user_id,
        payload.category_id,
        payload.name,
        payload.quantity,
        payload.min_quantity,
        payload.supplier_id,
        payload.price,
        payload.description,
      ]
    );

    const item = result.rows[0];

    // Pobierz pełne dane z JOIN
    const fullData = await db.query(
      `
      SELECT 
        i.*,
        s.name AS supplier_name,
        c.name AS category_name
      FROM items i
      LEFT JOIN suppliers s ON s.id = i.supplier_id
      LEFT JOIN categories c ON c.id = i.category_id
      WHERE i.id = $1
      `,
      [item.id]
    );

    const fullItem = fullData.rows[0];

    if (item.created) {
      return res.status(201).json({
        id: fullItem.id,
        item: fullItem,
        created: true,
        updated: false,
      });
    } else {
      return res.status(200).json({
        id: fullItem.id,
        item: fullItem,
        created: false,
        updated: true,
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

  const payload = normalizeItemPayload(req.body);

  payload.quantity = Number(payload.quantity);
  payload.min_quantity = Number(payload.min_quantity);
  payload.price = Number(payload.price);

  const errors = validateItem(payload, { isUpdate: true });
  if (errors.length > 0) return res.status(400).json({ errors });

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
      RETURNING *;
      `,
      [
        payload.name.trim(),
        payload.quantity,
        payload.min_quantity,
        payload.supplier_id,
        payload.price,
        payload.description,
        payload.category_id,
        id,
      ]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "Item not found" });
    }

    // --- POBIERAMY PEŁNE DANE Z JOINAMI ---
    const fullData = await db.query(
      `
      SELECT
        i.*,
        s.name AS supplier_name,
        c.name AS category_name
      FROM items i
      LEFT JOIN suppliers s ON s.id = i.supplier_id
      LEFT JOIN categories c ON c.id = i.category_id
      WHERE i.id = $1
      `,
      [id]
    );

    return res.json({
      updated: true,
      item: fullData.rows[0],
      message: "Item updated successfully",
    });
  } catch (error) {
    console.error("updateItem error:", error);

    // Obsługa konfliktu unikalnej nazwy
    if (error.code === "23505") {
      return res.status(400).json({
        errors: { name: "Item with this name already exists" },
      });
    }

    return res.status(500).json({ error: error.message });
  }
};

/* ------------------------------
    DELETE ITEM
  ------------------------------ */

export const deleteItem = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query("DELETE FROM items WHERE id = $1", [id]);

    res.json({ message: `Item ${id} deleted`, success: true });
  } catch (error) {
    console.error("deleteItem error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * SEARCH ITMES (ADVANCED)
 */
export const searchItemsAdvanced = async (req, res) => {
  const {
    q = "",
    category_id,
    supplier_id,
    stock,
    sort = "name",
    order = "asc",
    page = 1,
    limit = 20,
  } = req.query;
  const offset = (Number(page) - 1) * Number(limit);
  const sortMap = {
    name: "i.name",
    quantity: "i.quantity",
    min: "i.min_quantity", // ✅ TO JEST KLUCZ
    price: "i.price",
    created_at: "i.created_at",
    category: "c.name",
    supplier: "s.name",
  };

  const sortBy = sortMap[sort] ?? "i.name";

  const sortOrder = order === "desc" ? "DESC" : "ASC";

  const values = [];
  let where = "WHERE 1=1";
  if (q.trim()) {
    values.push(`%${q}%`);
    where += `
    AND (
      LOWER(i.name) LIKE LOWER($${values.length})
      OR LOWER(i.description) LIKE LOWER($${values.length})
    )
    `;
  }
  if (category_id) {
    values.push(Number(category_id));
    where += ` AND i.category_id = $${values.length}`;
  }

  if (stock === "out") {
    where += ` AND i.quantity = 0`;
  }

  if (stock === "low") {
    where += ` AND i.quantity > 0 AND i.quantity <= i.min_quantity`;
  }

  if (stock === "ok") {
    where += ` AND i.quantity > i.min_quantity`;
  }

  if (supplier_id) {
    values.push(Number(supplier_id));
    where += ` AND i.supplier_id = $${values.length}`;
  }

  try {
    const dataQuery = `
    SELECT 
       i.*,
        s.name AS supplier_name,
        c.name AS category_name
    FROM items i
    LEFT JOIN suppliers s ON s.id = i.supplier_id
    LEFT JOIN categories c ON c.id = i.category_id

    ${where}
    ORDER BY ${sortBy} ${sortOrder}
    LIMIT ${Number(limit)}
    OFFSET ${offset}
    `;
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM items i
      ${where}
    `;
    const [dataResult, countResult] = await Promise.all([
      db.query(dataQuery, values),
      db.query(countQuery, values),
    ]);
    return res.json({
      page: Number(page),
      limit: Number(limit),
      total: Number(countResult.rows[0].total),
      items: dataResult.rows,
    });
  } catch (error) {
    console.log("searchItemsAdvanced error:", error);
    return res.status(500).json({ error: error.message });
  }
};
