"use server";

import { auth, signOut } from "@/auth";
import { redirect, RedirectType } from "next/navigation";
import { setOptionCookies, updateKvkCookie } from "../kvknummer";

export async function SignOutAction() {
  const session = await auth();

  // Invalidate the usersession on the Keycloakserver.
  // (Passing the idToken will skip the logout confirmation page of Keycloak and immediately log out the user)
  const logoutUrl = session?.idToken
    ? `${process.env.AUTH_KEYCLOAK_ISSUER}/protocol/openid-connect/logout?id_token_hint=${session?.idToken}&post_logout_redirect_uri=${process.env.AUTH_URL}`
    : `${process.env.AUTH_KEYCLOAK_ISSUER}/protocol/openid-connect/logout`;

  // Invalidate the NextAuth session.
  await signOut({ redirect: false });

  setOptionCookies({});
  updateKvkCookie("");

  //return NextResponse.redirect(logoutUrl);
  redirect(logoutUrl, RedirectType.push);
}
