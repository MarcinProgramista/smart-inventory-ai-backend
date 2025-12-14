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
    ADD  CONTACT
  ------------------------------ */
export const addContact = async (req, res) => {
  const payload = normalizeContactPayload(req.body);
  const errors = validateContact(payload);
  if (errors.length > 0) return res.status(400).json({ errors });
  return res.json(payload);
};
