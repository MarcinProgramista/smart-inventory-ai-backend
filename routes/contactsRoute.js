import express from "express";
import {
  getAllContacts,
  addContact,
  updateContact,
} from "../controllers/contactsController.js";

const router = express.Router();

router.get("/", getAllContacts);
router.post("/", addContact);
router.patch("/:id", updateContact);
export default router;
