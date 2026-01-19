import NextAuth from "next-auth";
import Keycloak from "next-auth/providers/keycloak";
import { setOptionCookies, updateKvkCookie } from "./utils/kvknummer";
import { GetKvknummersByBsn } from "@/network/kvk/organisatieregister/fetchers/getKvknummersByBsn";

export const { handlers, signIn, signOut, auth } = NextAuth({
  debug: false,
  session: {
    strategy: "jwt",
    maxAge: 30 * 60, // 30 minutes
    updateAge: 30 * 60, // 30 minutes
  },
  callbacks: {
    authorized: async ({ auth, request }) => {
      // Logged in users are authenticated, otherwise redirect to login page
      return !!auth && request.nextUrl.basePath != "/";
    },

    async jwt({ token, account, profile, user }) {
      if (account && profile) {
        token.id = user.id;
        token.bsn = profile.bsn || null;
        token.preferred_username = profile.preferred_username;
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
        const kvkOpties = await GetKvknummersByBsn(profile.bsn);
        setOptionCookies(kvkOpties);
        if (kvkOpties.organisaties && kvkOpties.organisaties.length > 0) {
          updateKvkCookie(kvkOpties.organisaties[0].kvkNummer);
        } else {
          updateKvkCookie("");
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.bsn = token.bsn as string;
      session.user.preferred_username = token.preferred_username as string;
      session.accessToken = token.accessToken as string;
      session.idToken = token.idToken as string;

      return session;
    },
  },
  providers: [Keycloak],
});
