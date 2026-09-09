const KEY = "saturn_session_id";

export function getSessionId() {
  let id = localStorage.getItem(KEY);
  if (!id) {
    id =
      (crypto.randomUUID && crypto.randomUUID()) ||
      `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(KEY, id);
  }
  return id;
}
