import express from "express";
import {
  getAllContacts,
  addContact,
  updateContact,
  deleteContact,
  getContactById,
  searchContactsAdvanced,
} from "../controllers/contactsController.js";

const router = express.Router();

router.get("/", getAllContacts);
router.get("/search", searchContactsAdvanced);
router.post("/", addContact);
router.patch("/:id", updateContact);
router.delete("/:id", deleteContact);
router.get("/:id", getContactById);

export default router;
