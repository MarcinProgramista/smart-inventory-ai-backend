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
/* ------------------------------
   SEARCH CONTACTS (CLEAN)
------------------------------ */
export const searchContactsAdvanced = async (req, res) => {
  const { q = "", role, hasPhone, hasEmail, page = 1, limit = 20 } = req.query;
  console.log("QUERY PARAMS:", req.query);

  const offset = (Number(page) - 1) * Number(limit);

  const values = [];
  let where = "WHERE 1=1";

  // 🔎 SEARCH
  if (q.trim()) {
    values.push(`%${q}%`);
    where += `
      AND (
        first_name ILIKE $${values.length}
        OR last_name ILIKE $${values.length}
        OR email ILIKE $${values.length}
        OR role ILIKE $${values.length}
        OR mobile_phone ILIKE $${values.length}
      )
    `;
  }

  // 🧩 FILTER: role
  if (role) {
    values.push(role);
    where += ` AND role = $${values.length}`;
  }
  // 📞 FILTER: hasPhone
  if (hasPhone === "yes") {
    where += ` AND mobile_phone IS NOT NULL AND mobile_phone <> ''`;
  }

  if (hasPhone === "no") {
    where += ` AND (mobile_phone IS NULL OR mobile_phone = '')`;
  }

  //📧 FILTER: hasEmail
  if (hasEmail === "yes") {
    where += ` AND email IS NOT NULL AND email <> ''`;
  }

  if (hasEmail === "no") {
    where += ` AND (email IS NULL OR email = '')`;
  }

  try {
    const dataQuery = `
      SELECT *
      FROM contacts
      ${where}
      ORDER BY last_name ASC
      LIMIT $${values.length + 1}
      OFFSET $${values.length + 2}
    `;

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM contacts
      ${where}
    `;

    const [dataResult, countResult] = await Promise.all([
      db.query(dataQuery, [...values, Number(limit), offset]),
      db.query(countQuery, values),
    ]);

    return res.json({
      page: Number(page),
      limit: Number(limit),
      total: Number(countResult.rows[0].total),
      items: dataResult.rows,
    });
  } catch (error) {
    console.error("searchContactsAdvanced error:", error);
    return res.status(500).json({ error: error.message });
  }
};
