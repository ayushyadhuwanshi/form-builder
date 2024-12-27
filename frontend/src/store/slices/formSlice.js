import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  forms: [],
  loading: false,
  error: null,
};

const formSlice = createSlice({
  name: "form",
  initialState,
  reducers: {
    setForms: (state, action) => {
      state.forms = action.payload;
    },
    addForm: (state, action) => {
      state.forms.push(action.payload);
    },
    removeForm: (state, action) => {
      state.forms = state.forms.filter((form) => form._id !== action.payload);
    },
    updateForm: (state, action) => {
      const index = state.forms.findIndex(
        (form) => form._id === action.payload._id
      );
      if (index !== -1) {
        state.forms[index] = action.payload;
      }
    },
    setCurrentForm: (state, action) => {
      state.currentForm = action.payload;
    },
  },
});

export const { setForms, addForm, removeForm, updateForm, setCurrentForm } =
  formSlice.actions;

// Add selectors
export const selectForms = (state) => state.form.forms;
export const selectCurrentForm = (state) => state.form.currentForm;

export default formSlice.reducer;
