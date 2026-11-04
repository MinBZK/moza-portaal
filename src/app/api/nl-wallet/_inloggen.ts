import { cookies } from "next/headers";
import { getDemoPersonas } from "@/demo";
import type { Inlog } from "@/network/nl-wallet";
import {
  leesWalletInlog,
  NL_WALLET_INLOG_COOKIE,
  type WalletInlog,
} from "@/app/(public)/_persona";

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

/**
 * Of de lopende inlog een onderneming toevoegt aan wie al ingelogd is (vanuit
 * de organisatiekeuze in het portaal), of een nieuwe inlog is. Gezet bij het
 * starten van de sessie, zodat alle afloopwegen hetzelfde doen.
 */
const TOEVOEGEN_COOKIE = "nl-wallet-toevoegen";

export const zetToevoegen = async (toevoegen: boolean) => {
  const jar = await cookies();
  if (!toevoegen) {
    jar.delete({ name: TOEVOEGEN_COOKIE, path: "/api/nl-wallet" });
    return;
  }
  jar.set(TOEVOEGEN_COOKIE, "1", {
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
 *
 * Ingelogd is iemand alleen voor de onderneming uit de gedeelde bevoegdheid,
 * ook als de persona meer ondernemingen heeft. Voegt iemand vanuit het portaal
 * een onderneming toe (zelfde persoon), dan komt die erbij.
 */
export const logInMetWallet = async (inlog: Inlog) => {
  const jar = await cookies();
  const maxAge = 60 * 60 * 24 * 30;
  const naam = `${inlog.voornaam} ${inlog.achternaam}`;
  // Niet weghalen: dezelfde sessie kan twee keer langskomen (volgen en het
  // success-event). De volgende sessie zet het cookie opnieuw.
  const toevoegen = jar.get(TOEVOEGEN_COOKIE)?.value === "1";
  const kvkNummer = inlog.bevoegdheid?.kvkNummer;
  const persona = kvkNummer ? await personaBij(kvkNummer, naam) : undefined;
  if (persona && kvkNummer) {
    jar.set("personaId", persona.id, { path: "/", maxAge });
    jar.set("organisatieId", kvkNummer, { path: "/", maxAge });
  }
  const personaId = persona?.id ?? jar.get("personaId")?.value;
  if (!personaId) return persona?.id;

  const vorige = await leesWalletInlog();
  const zelfde =
    toevoegen &&
    vorige?.personaId === personaId &&
    vergelijkbaar(vorige.naam) === vergelijkbaar(naam);
  const kvkNummers = [
    ...new Set([
      ...(zelfde ? (vorige?.kvkNummers ?? []) : []),
      ...(kvkNummer ? [kvkNummer] : []),
    ]),
  ];
  const nieuw: WalletInlog = { personaId, naam, kvkNummers };
  jar.set(NL_WALLET_INLOG_COOKIE, JSON.stringify(nieuw), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
  });
  return persona?.id;
};
