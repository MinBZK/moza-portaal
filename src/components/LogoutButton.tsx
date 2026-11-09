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
      // Without a working Keycloak (as on ZAD) signOut fails; the demo must
      // still log out. So first signOut without redirect, then redirect here.
      await signOut({ redirect: false }).catch(() => undefined);
      // An API route that clears the cookies, not a page: a full navigation.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign("/api/persona-logout");
    }}
  >
    {children}
  </button>
);

export default LogoutButton;
