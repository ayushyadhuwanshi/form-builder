import { createSlice } from "@reduxjs/toolkit";

// Get initial state from localStorage
const userFromStorage = localStorage.getItem("user")
  ? JSON.parse(localStorage.getItem("user"))
  : null;

const initialState = {
  user: userFromStorage,
  isAuthenticated: !!userFromStorage,
  loading: false,
  error: null,
  workspaces: [], // Add workspaces to track shared workspaces
  currentWorkspace: null,
  notifications: [], // Add notifications for share requests
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      // Make sure the token is included in the payload
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.workspaces = [];
      state.currentWorkspace = null;
      state.notifications = [];
      localStorage.removeItem("user");
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    // Add new reducers for workspace management
    setWorkspaces: (state, action) => {
      state.workspaces = action.payload;
    },
    addWorkspace: (state, action) => {
      state.workspaces.push(action.payload);
    },
    removeWorkspace: (state, action) => {
      state.workspaces = state.workspaces.filter(
        (w) => w._id !== action.payload
      );
    },
    setCurrentWorkspace: (state, action) => {
      state.currentWorkspace = action.payload;
    },
    // Add notification handlers
    addNotification: (state, action) => {
      state.notifications.push(action.payload);
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    // Update user profile
    updateUserProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem("user", JSON.stringify(state.user));
    },
    // Handle workspace sharing
    addSharedWorkspace: (state, action) => {
      if (!state.workspaces.find((w) => w._id === action.payload._id)) {
        state.workspaces.push(action.payload);
      }
    },
    updateWorkspaceAccess: (state, action) => {
      const index = state.workspaces.findIndex(
        (w) => w._id === action.payload._id
      );
      if (index !== -1) {
        state.workspaces[index] = {
          ...state.workspaces[index],
          ...action.payload,
        };
      }
    },
  },
});

export const {
  setCredentials,
  logout,
  setLoading,
  setError,
  setWorkspaces,
  addWorkspace,
  removeWorkspace,
  setCurrentWorkspace,
  addNotification,
  removeNotification,
  clearNotifications,
  updateUserProfile,
  addSharedWorkspace,
  updateWorkspaceAccess,
} = authSlice.actions;

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectWorkspaces = (state) => state.auth.workspaces;
export const selectCurrentWorkspace = (state) => state.auth.currentWorkspace;
export const selectNotifications = (state) => state.auth.notifications;

export default authSlice.reducer;
