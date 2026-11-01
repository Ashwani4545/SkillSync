// Single source of truth for "is Clerk actually usable right now".
// A missing/placeholder NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY must not crash the
// app — Clerk's hooks/components throw if rendered outside a <ClerkProvider>, so anything
// that uses them (Navbar, layout.tsx) needs to check this first.
export function isClerkConfigured(): boolean {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";
  return Boolean(key) && key.startsWith("pk_") && !key.includes("ZXhhbXBsZQ") && !key.includes("dummy");
}
