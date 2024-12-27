import Form from "../models/formModel.js";
import Workspace from "../models/workspaceModel.js";
import crypto from "crypto";

// Get form by ID
const getFormById = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id).populate(
      "workspace",
      "name owner sharedWith"
    );

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    // Check if user has access
    const workspace = form.workspace;
    const hasAccess =
      workspace.owner.equals(req.user._id) ||
      workspace.sharedWith.some((share) => share.user.equals(req.user._id));

    if (!hasAccess) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(form);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update form
const updateForm = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id).populate(
      "workspace",
      "owner sharedWith"
    );

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    // Check if user has edit access
    const hasEditAccess =
      form.workspace.owner.equals(req.user._id) ||
      form.workspace.sharedWith.some(
        (share) => share.user.equals(req.user._id) && share.access === "edit"
      );

    if (!hasEditAccess) {
      return res.status(403).json({ message: "Not authorized to edit" });
    }

    // Update form fields
    form.name = req.body.name || form.name;
    form.questions = req.body.questions || form.questions;

    const updatedForm = await form.save();
    res.json(updatedForm);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Submit form response
const submitFormResponse = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    // Validate required fields
    const requiredQuestions = form.questions.filter((q) => q.required);
    const missingAnswers = requiredQuestions.filter(
      (q) => !req.body.answers.some((a) => a.question === q.question)
    );

    if (missingAnswers.length > 0) {
      return res.status(400).json({
        message: "Missing required answers",
        missingFields: missingAnswers.map((q) => q.question),
      });
    }

    // Add response
    form.responses.push({
      answers: req.body.answers,
      submittedAt: new Date(),
    });

    await form.save();
    res.status(201).json({ message: "Response submitted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get form responses
const getFormResponses = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id).populate(
      "workspace",
      "owner sharedWith"
    );

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    // Check if user has access
    const hasAccess =
      form.workspace.owner.equals(req.user._id) ||
      form.workspace.sharedWith.some((share) =>
        share.user.equals(req.user._id)
      );

    if (!hasAccess) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(form.responses);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Create share link
const createShareLink = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id).populate(
      "workspace",
      "owner sharedWith"
    );

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    // Check if user has access to share
    const hasAccess =
      form.workspace.owner.equals(req.user._id) ||
      form.workspace.sharedWith.some(
        (share) => share.user.equals(req.user._id) && share.access === "edit"
      );

    if (!hasAccess) {
      return res.status(403).json({ message: "Not authorized to share" });
    }

    // Generate unique share ID if not exists
    if (!form.shareId) {
      form.shareId = crypto.randomBytes(32).toString("hex");
      await form.save();
    }

    res.json({
      shareLink: `${process.env.FRONTEND_URL}/forms/shared/${form.shareId}`,
      shareId: form.shareId,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get form by share link
const getFormByShareLink = async (req, res) => {
  try {
    const form = await Form.findOne({ shareId: req.params.shareId }).select(
      "-responses"
    ); // Don't send responses for shared forms

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    res.json(form);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export {
  getFormById,
  updateForm,
  submitFormResponse,
  getFormResponses,
  getFormByShareLink,
  createShareLink,
};
