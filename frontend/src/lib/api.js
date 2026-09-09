import axios from "axios";
import { getSessionId } from "./session";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API });
api.interceptors.request.use((cfg) => {
  cfg.headers = cfg.headers || {};
  cfg.headers["X-Session-Id"] = getSessionId();
  const token = localStorage.getItem("saturn_access_token");
  if (token) cfg.headers["Authorization"] = `Bearer ${token}`;
  return cfg;
});

export function formatApiError(err, fallback = "Something went wrong") {
  const d = err?.response?.data?.detail;
  if (!d) return err?.message || fallback;
  if (typeof d === "string") return d;
  if (Array.isArray(d)) return d.map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).join(" · ");
  if (d && typeof d.msg === "string") return d.msg;
  return String(d);
}

export const subscribeNewsletter = (email, source = "marketing") =>
  api.post("/newsletter", { email, source }).then((r) => r.data);

export const getAeVersions = () => api.get("/ae-versions").then((r) => r.data);
export const getRules = () => api.get("/rules").then((r) => r.data);
export const getSamples = () => api.get("/samples").then((r) => r.data);
export const getSample = (id) => api.get(`/samples/${id}`).then((r) => r.data);

export const convertPreset = ({ file, targetVersion, targetOs, safeConversion, saveHistory = true }) => {
  const form = new FormData();
  form.append("file", file);
  form.append("target_version", targetVersion);
  form.append("target_os", targetOs);
  form.append("safe_conversion", String(safeConversion));
  form.append("save_history", String(saveHistory));
  return api.post("/convert", form, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data);
};

export const downloadPackage = async (conversionId) => {
  const res = await api.get(`/convert/${conversionId}/package`, { responseType: "blob" });
  const blob = res.data;
  const cd = res.headers["content-disposition"] || "";
  const m = /filename="?([^";]+)"?/.exec(cd);
  const filename = m ? m[1] : `conversion-${conversionId}.zip`;
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; document.body.appendChild(a); a.click();
  a.remove(); window.URL.revokeObjectURL(url);
};

export const getHistory = () => api.get("/history").then((r) => r.data);
export const deleteHistoryItem = (id) => api.delete(`/history/${id}`).then((r) => r.data);

export const savePreset = (body) => api.post("/presets", body).then((r) => r.data);
export const listPresets = () => api.get("/presets").then((r) => r.data);
export const getPreset = (id) => api.get(`/presets/${id}`).then((r) => r.data);
export const deletePreset = (id) => api.delete(`/presets/${id}`).then((r) => r.data);

export const getSettings = () => api.get("/settings").then((r) => r.data);
export const putSettings = (body) => api.put("/settings", body).then((r) => r.data);
