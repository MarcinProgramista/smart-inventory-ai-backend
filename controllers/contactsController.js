import { db } from "../db.js";
import { validateContact } from "../utils/validators/contactValidator.js";
import { normalizeContactPayload } from "../utils/validators/normalizeContact.js";

/* ------------------------------
    GET ALL CONTACTS
  ------------------------------ */
export const getAllContacts = async (req, res) => {
  const userId = Number(req.user?.id || req.query.user_id);

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ error: "user_id required" });
  }

  try {
    const result = await db.query(
      "SELECT * FROM contacts WHERE user_id = $1 ORDER BY last_name ASC",
      [userId]
    );
    return res.json(result.rows);
  } catch (error) {
    console.error("getContacts error:", error);
    return res.status(500).json({ error: error.message });
  }
};

/* ------------------------------
    ADD CONTACT
  ------------------------------ */
export const addContact = async (req, res) => {
  try {
    // Normalize input
    const payload = normalizeContactPayload(req.body);

    // Validate
    const errors = validateContact(payload);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // Extract normalized values
    const { user_id, first_name, last_name, role, mobile_phone, email } =
      payload;

    // Insert into DB
    const result = await db.query(
      `
      INSERT INTO contacts (
        user_id, first_name, last_name, role, mobile_phone, email
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [user_id, first_name, last_name, role, mobile_phone, email]
    );

    return res.status(201).json({
      message: "Contact created successfully",
      contact: result.rows[0],
    });
  } catch (error) {
    console.error("addContact error:", error);

    // Duplicate email? (You have an index on email)
    if (error.code === "23505") {
      return res.status(400).json({ error: "Email already exists" });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
};

/* ------------------------------
    UPDATE CONTACT
  ------------------------------ */
export const updateContact = async (req, res) => {
  const { id } = req.params;

  try {
    // Normalize input
    const payload = normalizeContactPayload(req.body);

    // Validate (update mode)
    const errors = validateContact(payload, { isUpdate: true });
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // Extract values
    const { first_name, last_name, role, mobile_phone, email, user_id } =
      payload;

    // Update contact
    const result = await db.query(
      `
      UPDATE contacts
      SET
        first_name = $1,
        last_name = $2,
        role = $3,
        mobile_phone = $4,
        email = $5,
        user_id = $6,
        updated_at = NOW()
      WHERE id = $7
      RETURNING *;
      `,
      [first_name, last_name, role, mobile_phone, email, user_id, id]
    );

    // If no record updated → not found
    if (!result.rows.length) {
      return res.status(404).json({ error: "Contact not found" });
    }

    return res.json({
      updated: true,
      contact: result.rows[0],
      message: "Contact updated successfully",
    });
  } catch (error) {
    console.error("updateContact error:", error);

    // Unique email conflict
    if (error.code === "23505") {
      return res.status(400).json({
        errors: { email: "Email already exists" },
      });
    }

    return res.status(500).json({ error: error.message });
  }
};
/* ------------------------------
    DELETE CONTACT
  ------------------------------ */
export const deleteContact = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      "DELETE FROM contacts WHERE id = $1 RETURNING *",
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "Contact not found" });
    }

    return res.json({
      deleted: true,
      message: `Contact ${id} deleted`,
      contact: result.rows[0],
    });
  } catch (error) {
    console.error("deleteContact error:", error);

    return res.status(500).json({
      error: error.message,
    });
  }
};

/* ------------------------------
    GET SINGLE CONTACT
  ------------------------------ */
export const getContactById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `
      SELECT *
      FROM contacts
      WHERE id = $1
      `,
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "Contact not found" });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("getContactById error:", error);
    return res.status(500).json({ error: error.message });
  }
};

/* ------------------------------
    SEARCH CONTACTS
  ------------------------------ */
export const searchContacts = async (req, res) => {
  const q = req.query.q || "";
  const sort = req.query.sort || "last_name";
  const order = req.query.order === "desc" ? "DESC" : "ASC";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  // Allowed sortable columns (security)
  const allowedSort = [
    "first_name",
    "last_name",
    "email",
    "role",
    "created_at",
    "updated_at",
  ];
  const sortBy = allowedSort.includes(sort) ? sort : "last_name";

  try {
    const like = `%${q}%`;

    const result = await db.query(
      `
      SELECT *
      FROM contacts
      WHERE 
        first_name ILIKE $1 OR
        last_name ILIKE $1 OR
        email ILIKE $1 OR
        role ILIKE $1 OR
        mobile_phone ILIKE $1
      ORDER BY ${sortBy} ${order}
      LIMIT $2
      OFFSET $3
      `,
      [like, limit, offset]
    );

    const countResult = await db.query(
      `
      SELECT COUNT(*) AS total
      FROM contacts
      WHERE 
        first_name ILIKE $1 OR
        last_name ILIKE $1 OR
        email ILIKE $1 OR
        role ILIKE $1 OR
        mobile_phone ILIKE $1
      `,
      [like]
    );

    return res.json({
      query: q,
      page,
      limit,
      total: Number(countResult.rows[0].total),
      results: result.rows,
    });
  } catch (error) {
    console.error("searchContacts error:", error);
    return res.status(500).json({ error: error.message });
  }
};
