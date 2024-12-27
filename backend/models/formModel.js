import mongoose from "mongoose";

const formSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    folder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
    },
    questions: [
      {
        type: {
          type: String,
          enum: ["text", "email", "phone", "number", "select"],
          required: true,
        },
        question: {
          type: String,
          required: true,
        },
        options: [String], // For select type questions
        required: {
          type: Boolean,
          default: false,
        },
      },
    ],
    responses: [
      {
        answers: [
          {
            question: String,
            answer: String,
          },
        ],
        submittedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    shareId: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

const Form = mongoose.model("Form", formSchema);
export default Form;
