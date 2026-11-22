
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export async function api(path, body, method) {
  const res = await fetch(`${API_BASE_URL}/api${path}`, {
    method: method || (body ? "POST" : "GET"),
    headers: body ? { "Content-Type": "application/json" } : undefined,
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}
