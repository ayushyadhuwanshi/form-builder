import Workspace from "../models/workspaceModel.js";
import Folder from "../models/folderModel.js";
import Form from "../models/formModel.js";
import User from "../models/userModel.js";

// Create Workspace
const createWorkspace = async (req, res) => {
  try {
    const { name } = req.body;
    const workspace = await Workspace.create({
      name,
      owner: req.user._id,
    });

    // Add workspace to user's workspaces
    await User.findByIdAndUpdate(req.user._id, {
      $push: { workspaces: workspace._id },
    });

    res.status(201).json(workspace);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all workspaces for a user
const getWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      $or: [{ owner: req.user._id }, { "sharedWith.user": req.user._id }],
    }).populate("owner", "username email");

    res.json(workspaces);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get workspace by ID
const getWorkspaceById = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id)
      .populate("owner", "username email")
      .populate("folders")
      .populate("forms")
      .populate("sharedWith.user", "username email");

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // Check if user has access
    const hasAccess =
      workspace.owner.equals(req.user._id) ||
      workspace.sharedWith.some((share) => share.user.equals(req.user._id));

    if (!hasAccess) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(workspace);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update workspace
const updateWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    if (!workspace.owner.equals(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    workspace.name = req.body.name || workspace.name;
    const updatedWorkspace = await workspace.save();

    res.json(updatedWorkspace);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete workspace
const deleteWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    if (!workspace.owner.equals(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Delete all associated folders and forms
    await Folder.deleteMany({ workspace: workspace._id });
    await Form.deleteMany({ workspace: workspace._id });
    await workspace.deleteOne();

    // Remove workspace from user's workspaces
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { workspaces: workspace._id },
    });

    res.json({ message: "Workspace deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Share workspace
const shareWorkspace = async (req, res) => {
  try {
    const { email, access } = req.body;
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    if (!workspace.owner.equals(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const userToShare = await User.findOne({ email });
    if (!userToShare) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already shared
    const alreadyShared = workspace.sharedWith.find((share) =>
      share.user.equals(userToShare._id)
    );

    if (alreadyShared) {
      alreadyShared.access = access;
    } else {
      workspace.sharedWith.push({ user: userToShare._id, access });
      // Add workspace to shared user's workspaces
      await User.findByIdAndUpdate(userToShare._id, {
        $push: { workspaces: workspace._id },
      });
    }

    await workspace.save();
    res.json(workspace);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Create folder
const createFolder = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const hasAccess =
      workspace.owner.equals(req.user._id) ||
      workspace.sharedWith.some(
        (share) => share.user.equals(req.user._id) && share.access === "edit"
      );

    if (!hasAccess) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const folder = await Folder.create({
      name: req.body.name,
      workspace: workspace._id,
    });

    workspace.folders.push(folder._id);
    await workspace.save();

    res.status(201).json(folder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete folder
const deleteFolder = async (req, res) => {
  try {
    const { id, folderId } = req.params;
    const workspace = await Workspace.findById(id);

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const hasAccess =
      workspace.owner.equals(req.user._id) ||
      workspace.sharedWith.some(
        (share) => share.user.equals(req.user._id) && share.access === "edit"
      );

    if (!hasAccess) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Delete folder and its forms
    await Form.deleteMany({ folder: folderId });
    await Folder.findByIdAndDelete(folderId);

    workspace.folders.pull(folderId);
    await workspace.save();

    res.json({ message: "Folder deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Create form
const createForm = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const hasAccess =
      workspace.owner.equals(req.user._id) ||
      workspace.sharedWith.some(
        (share) => share.user.equals(req.user._id) && share.access === "edit"
      );

    if (!hasAccess) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const form = await Form.create({
      name: req.body.name,
      workspace: workspace._id,
      folder: req.body.folderId || null,
      questions: req.body.questions || [],
    });

    if (req.body.folderId) {
      await Folder.findByIdAndUpdate(req.body.folderId, {
        $push: { forms: form._id },
      });
    }

    workspace.forms.push(form._id);
    await workspace.save();

    res.status(201).json(form);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete form
const deleteForm = async (req, res) => {
  try {
    const { id, formId } = req.params;
    const workspace = await Workspace.findById(id);

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const hasAccess =
      workspace.owner.equals(req.user._id) ||
      workspace.sharedWith.some(
        (share) => share.user.equals(req.user._id) && share.access === "edit"
      );

    if (!hasAccess) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const form = await Form.findById(formId);
    if (form.folder) {
      await Folder.findByIdAndUpdate(form.folder, {
        $pull: { forms: formId },
      });
    }

    await Form.findByIdAndDelete(formId);
    workspace.forms.pull(formId);
    await workspace.save();

    res.json({ message: "Form deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export {
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
};
