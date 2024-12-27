import express from "express";
import {
  getFormById,
  updateForm,
  submitFormResponse,
  getFormResponses,
  getFormByShareLink,
  createShareLink,
} from "../controllers/formController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected routes
router.use(protect);
router.get("/:id", getFormById);
router.put("/:id", updateForm);
router.post("/:id/responses", submitFormResponse);
router.get("/:id/responses", getFormResponses);
router.post("/:id/share", createShareLink);

// Public route for shared forms
router.get("/shared/:shareId", getFormByShareLink);

export default router;
