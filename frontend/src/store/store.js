import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import workspaceReducer from "./slices/workspaceSlice";
import formReducer from "./slices/formSlice";

// Load persisted state
const loadState = () => {
  try {
    const serializedState = localStorage.getItem("workspaceData");
    if (serializedState === null) {
      return {
        workspace: {
          currentWorkspace: null,
          folders: [],
          loading: false,
          error: null,
        },
        form: {
          forms: [],
          loading: false,
          error: null,
        },
      };
    }
    const data = JSON.parse(serializedState);
    return {
      workspace: {
        currentWorkspace: data.workspace || null,
        folders: data.folders || [],
        loading: false,
        error: null,
      },
      form: {
        forms: data.forms || [],
        loading: false,
        error: null,
      },
    };
  } catch (err) {
    console.error("Error loading state:", err);
    return {
      workspace: {
        currentWorkspace: null,
        folders: [],
        loading: false,
        error: null,
      },
      form: {
        forms: [],
        loading: false,
        error: null,
      },
    };
  }
};

const store = configureStore({
  reducer: {
    auth: authReducer,
    workspace: workspaceReducer,
    form: formReducer,
  },
  preloadedState: loadState(),
});

export default store;
