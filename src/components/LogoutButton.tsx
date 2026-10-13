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
    onClick={() => signOut({ redirectTo: "/api/persona-logout" })}
  >
    {children}
  </button>
);

export default LogoutButton;
