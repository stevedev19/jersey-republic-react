/**
 * Newsletter signup. Stub for now: replace the body with the real request, e.g.
 *
 *   const res = await fetch(`${serverApiBase}/newsletter`, {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify({ email }),
 *   });
 *   if (!res.ok) throw new Error(`Newsletter signup failed: ${res.status}`);
 *
 * Resolve on success, throw on failure; the footer form handles both.
 */
export async function subscribeToNewsletter(email: string): Promise<void> {
  // TODO: call the real newsletter API.
  await new Promise((resolve) => setTimeout(resolve, 800));
  if (!email) throw new Error("Missing email");
}

/** Deliberately loose: catches typos like a missing @ or domain, leaves the rest to the server. */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}
