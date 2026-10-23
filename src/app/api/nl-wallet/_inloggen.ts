import { cookies } from "next/headers";
import { getDemoPersonas } from "@/demo";
import type { Inlog } from "@/network/nl-wallet";
import { NL_WALLET_INLOG_COOKIE } from "@/app/(public)/_persona";

/**
 * Het sessietoken van de lopende inlog, zodat de pagina de sessie kan volgen
 * zonder dat de knop van NL Wallet het token meldt (dat doet die pas bij
 * sluiten). Alleen voor /api/nl-wallet.
 */
const SESSIE_COOKIE = "nl-wallet-sessie";

export const leesSessie = async () =>
  (await cookies()).get(SESSIE_COOKIE)?.value ?? null;

export const zetSessie = async (token: string | null) => {
  const jar = await cookies();
  if (!token) {
    jar.delete({ name: SESSIE_COOKIE, path: "/api/nl-wallet" });
    return;
  }
  jar.set(SESSIE_COOKIE, token, {
    path: "/api/nl-wallet",
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
};

const vergelijkbaar = (naam: string) =>
  naam
    .replace(/ı/g, "i")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

/**
 * De persona bij het KVK-nummer uit de bevoegdheid: eerst de persona met die
 * onderneming en dezelfde naam als in de wallet (Karin Jansen en Bilal Yılmaz
 * horen allebei bij Koffiezaak Noon), dan een persona met die onderneming als
 * eerste organisatie, anders de enige persona met die onderneming.
 */
const personaBij = async (kvkNummer: string, naam: string) => {
  const personas = await getDemoPersonas();
  const met = personas.filter((persona) =>
    persona.organisaties.some((o) => o.kvkNummer === kvkNummer),
  );
  const zelfde = met.find(
    (persona) =>
      vergelijkbaar(
        `${persona.persoon.voornaam} ${persona.persoon.achternaam}`,
      ) === vergelijkbaar(naam),
  );
  if (zelfde) return zelfde;
  const eerst = met.find(
    (persona) => persona.organisaties[0]?.kvkNummer === kvkNummer,
  );
  if (eerst) return eerst;
  return met.length === 1 ? met[0] : undefined;
};

/**
 * Logt in met wat uit de wallet kwam: de persona volgt uit de bevoegdheid, de
 * naam komt uit de wallet. Zonder passende persona blijft de huidige staan.
 */
export const logInMetWallet = async (inlog: Inlog) => {
  const jar = await cookies();
  const maxAge = 60 * 60 * 24 * 30;
  const naam = `${inlog.voornaam} ${inlog.achternaam}`;
  const persona = inlog.bevoegdheid
    ? await personaBij(inlog.bevoegdheid.kvkNummer, naam)
    : undefined;
  if (persona && inlog.bevoegdheid) {
    jar.set("personaId", persona.id, { path: "/", maxAge });
    jar.set("organisatieId", inlog.bevoegdheid.kvkNummer, {
      path: "/",
      maxAge,
    });
  }
  const personaId = persona?.id ?? jar.get("personaId")?.value;
  if (personaId)
    jar.set(
      NL_WALLET_INLOG_COOKIE,
      JSON.stringify({
        personaId,
        naam,
      }),
      { path: "/", httpOnly: true, sameSite: "lax" },
    );
  return persona?.id;
};
