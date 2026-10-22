import { supabase } from "@/integrations/supabase/client";

/** Shared password rules (aligned with ResetPassword). */
export function validatePasswordStrength(
  pwd: string,
  t: (key: string) => string,
): string | null {
  if (pwd.length < 8) return t("resetPassword.rules.minLength");
  if (!/[A-Z]/.test(pwd)) return t("resetPassword.rules.uppercase");
  if (!/[a-z]/.test(pwd)) return t("resetPassword.rules.lowercase");
  if (!/\d/.test(pwd)) return t("resetPassword.rules.digit");
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>?]/.test(pwd)) {
    return t("resetPassword.rules.special");
  }
  return null;
}

/**
 * Change password for an email/password user and revoke all other sessions.
 * Keeps the current session when Supabase allows it (`scope: 'others'`).
 */
export async function changePasswordAndRevokeOthers(params: {
  email: string;
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  const { email, currentPassword, newPassword } = params;

  if (!email?.trim()) {
    throw new Error("NO_EMAIL");
  }
  if (!currentPassword) {
    throw new Error("MISSING_CURRENT");
  }
  if (currentPassword === newPassword) {
    throw new Error("SAME_PASSWORD");
  }

  // Re-authenticate: proves possession of the current password before rotation.
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password: currentPassword,
  });
  if (verifyError) {
    throw new Error("INVALID_CURRENT");
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (updateError) {
    throw updateError;
  }

  // Kill concurrent sessions on other browsers/devices (OWASP).
  // Access JWTs may remain valid until expiry; refresh tokens are revoked.
  const { error: revokeError } = await supabase.auth.signOut({
    scope: "others",
  });
  if (revokeError) {
    console.warn("Failed to revoke other sessions after password change:", revokeError);
  }
}

/** Revoke every other session while keeping the current one. */
export async function revokeOtherSessions(): Promise<void> {
  const { error } = await supabase.auth.signOut({ scope: "others" });
  if (error) throw error;
}

/** After a recovery-link password reset: revoke all sessions, force re-login. */
export async function revokeAllSessionsAfterPasswordReset(): Promise<void> {
  const { error } = await supabase.auth.signOut({ scope: "global" });
  if (error) {
    // Still clear local storage if remote revoke fails
    console.warn("Global signOut after password reset failed:", error);
    await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
  }
}
