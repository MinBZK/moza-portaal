import { NL_WALLET_INLOG_COOKIE } from "@/app/(public)/_persona";

/**
 * Uitloggen uit de demo: persona, organisatie en de naam uit NL Wallet weg, en
 * terug naar de landingspagina. Een relatieve Location, want achter de proxy
 * van ZAD is request.url het interne adres (https://0.0.0.0:3000).
 */
export function GET() {
  const headers = new Headers({ Location: "/" });
  for (const name of ["personaId", "organisatieId", NL_WALLET_INLOG_COOKIE]) {
    headers.append(
      "Set-Cookie",
      `${name}=; Path=/; Max-Age=0; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
    );
  }
  return new Response(null, { status: 307, headers });
}
