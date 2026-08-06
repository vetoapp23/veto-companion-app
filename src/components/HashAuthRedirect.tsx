import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * If OAuth dumped tokens on the wrong path (e.g. /dashboard#access_token=…),
 * bounce to /auth/callback while keeping the hash so the client can parse the session.
 */
export function HashAuthRedirect() {
  const location = useLocation();

  useEffect(() => {
    const hash = window.location.hash || "";
    if (!hash.includes("access_token") && !hash.includes("refresh_token")) return;
    if (location.pathname === "/auth/callback") return;
    window.location.replace(`${window.location.origin}/auth/callback${hash}`);
  }, [location.pathname]);

  return null;
}
