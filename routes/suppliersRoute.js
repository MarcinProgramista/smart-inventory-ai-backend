import express from "express";
import {
  getSuppliers,
  addSupplier,
  updateSupplier,
  deleteSupplier,
} from "../controllers/suppliersController.js";

const router = express.Router();

router.get("/", getSuppliers);
router.post("/", addSupplier);
router.patch("/:id", updateSupplier);
router.delete("/:id", deleteSupplier);

export default router;
