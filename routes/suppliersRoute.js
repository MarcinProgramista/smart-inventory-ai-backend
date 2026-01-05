import express from "express";
import {
  getSuppliers,
  addSupplier,
  updateSupplier,
  deleteSupplier,
  searchSuppliersAdvanced,
} from "../controllers/suppliersController.js";

const router = express.Router();

/* 🔎 ZAWSZE NA GÓRZE */
router.get("/search", searchSuppliersAdvanced);

router.get("/", getSuppliers);
router.post("/", addSupplier);
router.patch("/:id", updateSupplier);
router.delete("/:id", deleteSupplier);

export default router;
