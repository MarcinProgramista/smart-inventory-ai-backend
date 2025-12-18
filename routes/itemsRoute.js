// routes/itemsRoute.js
import express from "express";
import {
  getAllItems,
  addItem,
  updateItem,
  deleteItem,
  searchItemsAdvanced,
} from "../controllers/itemsController.js";

const router = express.Router();

router.get("/", getAllItems);

router.post("/", addItem);
router.patch("/:id", updateItem);
router.delete("/:id", deleteItem);
router.get("/search", searchItemsAdvanced);
export default router;
