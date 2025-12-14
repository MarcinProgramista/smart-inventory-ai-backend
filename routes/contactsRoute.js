import express from "express";
import { getAllContacts } from "../controllers/contactsController.js";

const router = express.Router();

router.get("/", getAllContacts);

export default router;
