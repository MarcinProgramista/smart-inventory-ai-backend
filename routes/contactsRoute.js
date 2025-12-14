import express from "express";
import {
  getAllContacts,
  addContact,
  updateContact,
  deleteContact,
  getContactById,
} from "../controllers/contactsController.js";

const router = express.Router();

router.get("/", getAllContacts);
router.post("/", addContact);
router.patch("/:id", updateContact);
router.delete("/:id", deleteContact);
router.get("/:id", getContactById);

export default router;
