import express from "express";
import { authenticate } from "../Middleware/auth.middleware";
import { authorizeRole } from "../Middleware/role.middleware";
import {
  propertyById,
  propertyCreate,
  propertyDelete,
  propertyEdit,
  propertyList,
  propertyRead,
} from "./property.controller";

const router = express.Router();

router.post("/create", authenticate, authorizeRole("ADMIN"), propertyCreate);
router.put("/edit/:id", authenticate, authorizeRole("ADMIN"), propertyEdit);
router.delete(
  "/delete/:id",
  authenticate,
  authorizeRole("ADMIN"),
  propertyDelete
);
router.get("/get", authenticate, authorizeRole("ADMIN"), propertyRead);
router.get("/list", authenticate, authorizeRole("ADMIN"), propertyList);
router.get("/:id", authenticate, authorizeRole("ADMIN"), propertyById);

export default router;
