import { db } from "../db.js";

/* ------------------------------
    GET ALL CONTACTS
  ------------------------------ */
export const getAllContacts = async (req, res) => {
  const userId = Number(req.user?.id || req.query.user_id);
  console.log(userId, req.query.user_id);
  res.json(userId);
};
