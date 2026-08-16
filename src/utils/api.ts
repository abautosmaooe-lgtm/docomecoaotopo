/**
 * Safe helper to fetch json from backend API with fallback
 */
export async function safeFetchJson<T = any>(url: string, fallback: T | null = null): Promise<T | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return fallback;
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await res.json();
      return data;
    }
    return fallback;
  } catch {
    return fallback;
  }
}
