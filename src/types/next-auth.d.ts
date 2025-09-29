import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      /** Default user properties */
      email: string;

      /** Custom fields */
      bsn: string;
      preferred_username: string;
    } & DefaultSession["user"];

    accessToken?: string;
    idToken?: string;
  }
  interface Profile {
    bsn: string;
  }
}
