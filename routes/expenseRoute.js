import express from "express";
import {
  createItem,
  deleteItem,
  getItems,
  updateItem,
} from "../controller/expenseController.js";

const router = express.Router();

router.get("/:section", getItems);
router.post("/:section", createItem);
router.put("/:section/:id", updateItem);
router.delete("/:section/:id", deleteItem);

export default router;
