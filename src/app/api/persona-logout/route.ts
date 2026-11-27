import { cookies } from "next/headers";
import { NL_WALLET_INLOG_COOKIE } from "@/app/(public)/_persona";
import {
  beeindigBijStelsel,
  leesSessie,
  SESSIE_COOKIE,
  sessieCookie,
} from "@/network/keten/sessie";

/**
 * Uitloggen uit de demo: persona, organisatie en de naam uit NL Wallet weg, en
 * terug naar de landingspagina. Een relatieve Location, want achter de proxy
 * van ZAD is request.url het interne adres (https://0.0.0.0:3000). Ook de
 * sessie bij het Federatief Berichtenstelsel stopt: daarna zijn de berichten
 * van deze ondernemer daar niet meer op te vragen.
 */
export async function GET() {
  const sessie = leesSessie((await cookies()).get(SESSIE_COOKIE)?.value);
  if (sessie) await beeindigBijStelsel(sessie);

  const headers = new Headers({ Location: "/" });
  for (const name of ["personaId", "organisatieId", NL_WALLET_INLOG_COOKIE]) {
    headers.append(
      "Set-Cookie",
      `${name}=; Path=/; Max-Age=0; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
    );
  }
  headers.append("Set-Cookie", sessieCookie(null));
  return new Response(null, { status: 307, headers });
}
