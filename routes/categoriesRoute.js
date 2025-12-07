import express from "express";
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoriesController.js";

const router = express.Router();

router.get("/", getCategories); // GET /api/categories?user_id=1
router.post("/", addCategory); // POST /api/categories
router.patch("/", updateCategory); // PATCH /api/categories
router.delete("/:id", deleteCategory); // DELETE /api/categories/:id

export default router;
