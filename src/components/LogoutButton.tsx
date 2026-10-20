"use client";

import type { ReactNode } from "react";
import { signOut } from "next-auth/react";

const LogoutButton = ({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) => (
  <button
    type="button"
    className={className}
    onClick={async () => {
      // Zonder werkende Keycloak (zoals op ZAD) faalt signOut; de demo moet
      // dan toch uitloggen. Daarom eerst signOut zonder redirect, daarna zelf.
      await signOut({ redirect: false }).catch(() => undefined);
      window.location.assign("/api/persona-logout");
    }}
  >
    {children}
  </button>
);

export default LogoutButton;
