import express from "express";
import {
  createWorkspace,
  getWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  shareWorkspace,
  createFolder,
  deleteFolder,
  createForm,
  deleteForm,
} from "../controllers/workspaceController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.route("/").get(getWorkspaces).post(createWorkspace);

router
  .route("/:id")
  .get(getWorkspaceById)
  .put(updateWorkspace)
  .delete(deleteWorkspace);

router.post("/:id/share", shareWorkspace);
router.post("/:id/folders", createFolder);
router.delete("/:id/folders/:folderId", deleteFolder);
router.post("/:id/forms", createForm);
router.delete("/:id/forms/:formId", deleteForm);

export default router;
