import { createSlice } from "@reduxjs/toolkit";
import { workspaceAPI } from "../../services/api";
import { setForms } from "./formSlice";

const initialState = {
  workspaces: [],
  currentWorkspace: null,
  folders: [],
  loading: false,
  error: null,
};

// Add persistence middleware
const persistWorkspace = (store) => (next) => (action) => {
  const result = next(action);
  const state = store.getState();

  if (action.type.startsWith("workspace/")) {
    try {
      localStorage.setItem(
        "workspaceState",
        JSON.stringify({
          currentWorkspace: state.workspace.currentWorkspace,
          folders: state.workspace.folders,
        })
      );
    } catch (err) {
      console.error("Failed to save workspace state:", err);
    }
  }
  return result;
};

// Add initialization action
export const initializeWorkspaceState = () => (dispatch) => {
  try {
    const savedState = localStorage.getItem("workspaceState");
    if (savedState) {
      const { currentWorkspace, folders } = JSON.parse(savedState);
      dispatch(setCurrentWorkspace(currentWorkspace));
      dispatch(setFolders(folders));
    }
  } catch (err) {
    console.error("Failed to load workspace state:", err);
  }
};

const workspaceSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {
    setWorkspaces: (state, action) => {
      state.workspaces = action.payload;
    },
    setCurrentWorkspace: (state, action) => {
      state.currentWorkspace = action.payload;
      state.folders = action.payload?.folders || [];
    },
    setFolders: (state, action) => {
      state.folders = action.payload;
    },
    addWorkspace: (state, action) => {
      state.workspaces.push(action.payload);
    },
    updateWorkspace: (state, action) => {
      const index = state.workspaces.findIndex(
        (w) => w._id === action.payload._id
      );
      if (index !== -1) {
        state.workspaces[index] = action.payload;
        if (state.currentWorkspace?._id === action.payload._id) {
          state.currentWorkspace = action.payload;
        }
      }
    },
    removeWorkspace: (state, action) => {
      state.workspaces = state.workspaces.filter(
        (w) => w._id !== action.payload
      );
      if (state.currentWorkspace?._id === action.payload) {
        state.currentWorkspace = null;
      }
    },
    // Folder actions
    addFolder: (state, action) => {
      state.folders.push(action.payload);
      if (state.currentWorkspace) {
        state.currentWorkspace.folders = state.folders;
      }
    },
    updateFolder: (state, action) => {
      const index = state.folders.findIndex(
        (f) => f._id === action.payload._id
      );
      if (index !== -1) {
        state.folders[index] = action.payload;
        if (state.currentWorkspace) {
          state.currentWorkspace.folders = state.folders;
        }
      }
    },
    removeFolder: (state, action) => {
      state.folders = state.folders.filter((f) => f._id !== action.payload);
      if (state.currentWorkspace) {
        state.currentWorkspace.folders = state.folders;
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setWorkspaces,
  setCurrentWorkspace,
  addWorkspace,
  updateWorkspace,
  removeWorkspace,
  addFolder,
  updateFolder,
  removeFolder,
  setFolders,
  setLoading,
  setError,
} = workspaceSlice.actions;

// Selectors
export const selectWorkspaces = (state) => state.workspace.workspaces;
export const selectCurrentWorkspace = (state) =>
  state.workspace.currentWorkspace;
export const selectFolders = (state) => state.workspace.folders;
export const selectLoading = (state) => state.workspace.loading;
export const selectError = (state) => state.workspace.error;

// Thunk for loading workspace data
export const loadWorkspaceData = (workspaceId) => async (dispatch) => {
  try {
    const { data } = await workspaceAPI.getWorkspaceById(workspaceId);
    dispatch(setCurrentWorkspace(data));
    dispatch(setFolders(data.folders || []));
    dispatch(setForms(data.forms || []));
  } catch (error) {
    console.error("Failed to load workspace data:", error);
  }
};

// Add a new action to sync workspace data
export const syncWorkspaceData = (workspaceId) => async (dispatch) => {
  try {
    const { data } = await workspaceAPI.getWorkspaceById(workspaceId);
    dispatch(setCurrentWorkspace(data));
    dispatch(setFolders(data.folders || []));
    dispatch(setForms(data.forms || []));
  } catch (error) {
    console.error("Failed to sync workspace data:", error);
  }
};

// Add the middleware to your store
export const workspaceMiddleware = [persistWorkspace];

export default workspaceSlice.reducer;
