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

  await revokeOtherSessions();
}

/** Revoke every other session while keeping the current one. */
export async function revokeOtherSessions(): Promise<void> {
  // 1) GoTrue API (refresh-token revoke)
  const { error: apiError } = await supabase.auth.signOut({ scope: "others" });
  if (apiError) {
    console.warn("signOut(others) failed:", apiError);
  }

  // 2) DB-level belt: delete other rows in auth.sessions for this user
  const { error: rpcError } = await supabase.rpc("revoke_other_auth_sessions");
  if (rpcError) {
    // If GoTrue already succeeded, RPC failure is non-fatal for UX
    if (apiError) throw rpcError;
    console.warn("revoke_other_auth_sessions RPC failed:", rpcError);
  }

  if (apiError && rpcError) {
    throw apiError;
  }
}

/** After a recovery-link password reset: revoke all sessions, force re-login. */
export async function revokeAllSessionsAfterPasswordReset(): Promise<void> {
  // Wipe sessions in DB while JWT is still valid
  const { error: rpcError } = await supabase.rpc("revoke_all_auth_sessions");
  if (rpcError) {
    console.warn("revoke_all_auth_sessions RPC failed:", rpcError);
  }

  const { error } = await supabase.auth.signOut({ scope: "global" });
  if (error) {
    console.warn("Global signOut after password reset failed:", error);
    await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
  }
}
