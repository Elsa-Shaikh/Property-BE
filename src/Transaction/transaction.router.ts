import express from "express";
import { authenticate } from "../Middleware/auth.middleware";
import { authorizeRole } from "../Middleware/role.middleware";
import {
  monthlyReport,
  transactionCreate,
  transactionDelete,
  transactionEdit,
  transactionRead,
  transactionReadById,
} from "./transaction.controller";

const router = express.Router();

router.post("/create", authenticate, authorizeRole("ADMIN"), transactionCreate);
router.put("/edit/:id", authenticate, authorizeRole("ADMIN"), transactionEdit);
router.delete(
  "/delete/:id",
  authenticate,
  authorizeRole("ADMIN"),
  transactionDelete
);
router.get("/get", authenticate, authorizeRole("ADMIN"), transactionRead);
router.get(
  "/monthly-report",
  authenticate,
  authorizeRole("ADMIN"),
  monthlyReport
);

router.get("/:id", authenticate, authorizeRole("ADMIN"), transactionReadById);

export default router;
