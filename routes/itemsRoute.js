// routes/itemsRoute.js
import express from "express";
import {
  getAllItems,
  searchItems,
  addItem,
  updateItem,
  deleteItem,
} from "../controllers/itemsController.js";

const router = express.Router();

router.get("/", getAllItems);
router.get("/search", searchItems);
router.post("/", addItem);
router.patch("/:id", updateItem);
router.delete("/:id", deleteItem);

export default router;
