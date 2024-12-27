import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5001/api",
  withCredentials: true,
});

// Add request interceptor to include token
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (userData) => api.post("/users/register", userData),
  login: (credentials) => api.post("/users/login", credentials),
  logout: () => api.post("/users/logout"),
  getProfile: () => api.get("/users/profile"),
  updateProfile: (userData) => api.put("/users/profile", userData),
};

// Workspace API
export const workspaceAPI = {
  createWorkspace: async (data) => {
    return await api.post("/workspaces", data);
  },
  getWorkspaces: () => api.get("/workspaces"),
  getWorkspaceById: (id) => api.get(`/workspaces/${id}`),
  updateWorkspace: (id, data) => api.put(`/workspaces/${id}`, data),
  deleteWorkspace: (id) => api.delete(`/workspaces/${id}`),
  shareWorkspace: (id, data) => api.post(`/workspaces/${id}/share`, data),
  createFolder: (id, data) => api.post(`/workspaces/${id}/folders`, data),
  deleteFolder: (workspaceId, folderId) =>
    api.delete(`/workspaces/${workspaceId}/folders/${folderId}`),
  createForm: (id, data) => api.post(`/workspaces/${id}/forms`, data),
  deleteForm: (workspaceId, formId) =>
    api.delete(`/workspaces/${workspaceId}/forms/${formId}`),
};

// Form API
export const formAPI = {
  getFormById: (id) => api.get(`/forms/${id}`),
  updateForm: (id, data) => {
    if (!id || !data) {
      throw new Error("Missing required parameters");
    }

    const formData = {
      name: data.name,
      questions: data.questions.map((q) => ({
        text: q.text || "",
        type: q.type || "text",
        required: Boolean(q.required),
        options: q.type === "select" ? q.options || [] : undefined,
      })),
      workspace: data.workspace,
      folder: data.folder,
      isPublic: Boolean(data.isPublic),
    };

    return api.put(`/forms/${id}`, formData);
  },
  submitResponse: (id, data) => api.post(`/forms/${id}/responses`, data),
  getResponses: (id) => api.get(`/forms/${id}/responses`),
  createShareLink: (id) => api.post(`/forms/${id}/share`),
  getSharedForm: (shareId) => api.get(`/forms/shared/${shareId}`),
};

export default api;
