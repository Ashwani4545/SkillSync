// Single source of truth for "is Clerk actually usable right now".
// A missing/placeholder NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY must not crash the app.
// Clerk will throw if it receives a non-real key or a dummy placeholder value.
export function isClerkConfigured(): boolean {
  const key = (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "").trim();

  if (!key) return false;

  const normalized = key.toLowerCase();
  if (
    normalized.includes("dummy") ||
    normalized.includes("example") ||
    normalized.includes("placeholder") ||
    normalized.includes("replace") ||
    normalized.includes("test_dummy") ||
    normalized.includes("your_")
  ) {
    return false;
  }

  return /^pk_(live|test)_[A-Za-z0-9_-]{20,}$/.test(key);
}
