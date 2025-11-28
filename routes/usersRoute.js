import express from "express";
import {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
} from "../controllers/usersController.js";

const router = express.Router();

router.get("/", getAllUsers);
router.get("/:id", getUser);
router.patch("/update", updateUser);
router.delete("/delete/:id", deleteUser);

export default router;
