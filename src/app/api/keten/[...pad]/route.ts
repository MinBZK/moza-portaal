import type { NextRequest } from "next/server";
import { getKetenAccount } from "@/app/(public)/_persona";
import { KETEN_URL, ketenOntvanger } from "@/network/keten";
import {
  beeindigBijStelsel,
  leesSessie,
  SESSIE_COOKIE,
  sessieCookie,
  sessieHeaders,
  startBijStelsel,
  type KetenSessie,
} from "@/network/keten/sessie";

/**
 * Doorgeefluik naar het Federatief Berichtenstelsel, zoals nginx en
 * keten-proxy.js in moza-poc. Anders dan daar bepaalt de server de ontvanger,
 * uit het persona-cookie, en houdt hij het sessie-id bij zich: de browser kan
 * geen andere ontvanger kiezen en ziet het geheim niet.
 */

// Ophalen en volgen zijn Server-Sent Events: niet bufferen of cachen.
export const dynamic = "force-dynamic";

// Alleen de paden die de berichtenbox gebruikt.
const BERICHTEN =
  /^berichten(\/_ophalen|\/_volgen|\/[\w-]+(\/bijlagen\/[\w-]+)?)?$/;
const BIJLAGE = /^berichten\/[\w-]+\/bijlagen\/[\w-]+$/;

const DOOR_TE_GEVEN = ["accept", "content-type"];
const TERUG_TE_GEVEN = [
  "content-type",
  "content-disposition",
  "content-security-policy",
  "x-content-type-options",
  "retry-after",
];

const ONGELDIG = {
  type: "urn:fbs:fout:sessie-ongeldig",
  title: "Unauthorized",
  status: 401,
  detail: "Er is geen sessie bij het stelsel.",
};

const probleem = (lichaam: object, status: number, extra?: Headers) => {
  const headers = new Headers(extra);
  headers.set("content-type", "application/problem+json");
  return new Response(JSON.stringify(lichaam), { status, headers });
};

// Een bijlage opent in een eigen tabblad; daar hoort leesbare tekst, geen JSON.
const bijlageTekst = (status: number) =>
  status === 401
    ? "Uw sessie is verlopen. Ga terug naar het bericht en open de bijlage daar opnieuw."
    : status === 429 || status === 503
      ? "Deze bijlage is nu even niet op te halen. Probeer het over een minuut opnieuw."
      : "Deze bijlage is nu niet op te halen. Probeer het later opnieuw.";

const terugHeaders = (antwoord: Response) => {
  const terug = new Headers({
    "cache-control": "no-cache, no-transform",
    "x-accel-buffering": "no",
  });
  for (const naam of TERUG_TE_GEVEN) {
    const waarde = antwoord.headers.get(naam);
    if (waarde) terug.set(naam, waarde);
  }
  return terug;
};

const stelselOnbereikbaar = () =>
  Response.json(
    {
      fout: "Wij kunnen uw berichten nu niet ophalen. Probeer het later opnieuw.",
    },
    { status: 502 },
  );

/**
 * Start een sessie; een vorige sessie van deze ontvanger stopt eerst. `wis`:
 * het cookie hoort bij een andere ontvanger en moet ook weg als starten mislukt.
 */
const startSessie = async (
  ontvanger: string,
  vorige: KetenSessie | null,
  wis: boolean,
) => {
  if (vorige) await beeindigBijStelsel(vorige);
  let uitkomst;
  try {
    uitkomst = await startBijStelsel(ontvanger);
  } catch {
    return stelselOnbereikbaar();
  }
  if ("antwoord" in uitkomst) {
    const { antwoord } = uitkomst;
    const terug = terugHeaders(antwoord);
    if (vorige || wis) terug.append("set-cookie", sessieCookie(null));
    return new Response(antwoord.body, {
      status: antwoord.status,
      headers: terug,
    });
  }
  // Het sessie-id blijft in het cookie; het antwoord noemt het niet.
  return new Response(null, {
    status: 201,
    headers: { "set-cookie": sessieCookie(uitkomst.sessie) },
  });
};

const stuurDoor = async (
  request: NextRequest,
  { params }: { params: Promise<{ pad: string[] }> },
) => {
  const pad = (await params).pad.join("/");
  const sessiePad =
    (pad === "sessies" && request.method === "POST") ||
    (pad === "sessies/huidige" && request.method === "DELETE") ||
    (pad === "sessies/huidige/_verlengen" && request.method === "POST");
  const berichtenPad = BERICHTEN.test(pad) && request.method !== "POST";
  if (!sessiePad && !berichtenPad)
    return Response.json({ fout: "Onbekend pad." }, { status: 404 });

  const ontvanger = ketenOntvanger(await getKetenAccount());
  if (!ontvanger)
    return Response.json(
      { fout: "Deze persona heeft geen berichten. Kies een andere persona." },
      { status: 403 },
    );

  const opgeslagen = leesSessie(request.cookies.get(SESSIE_COOKIE)?.value);
  // Een sessie van een vorige persona hoort niet bij deze ontvanger.
  const sessie = opgeslagen?.ontvanger === ontvanger ? opgeslagen : null;
  const vanAnder = opgeslagen && !sessie ? opgeslagen : null;
  if (vanAnder) void beeindigBijStelsel(vanAnder);

  if (pad === "sessies") return startSessie(ontvanger, sessie, !!vanAnder);

  if (pad === "sessies/huidige") {
    if (sessie) await beeindigBijStelsel(sessie);
    return new Response(null, {
      status: 204,
      headers: { "set-cookie": sessieCookie(null) },
    });
  }

  if (!sessie && pad === "sessies/huidige/_verlengen")
    return probleem(ONGELDIG, 401);

  // Geen Origin: het CORS-filter van het stelsel weigert anders PATCH en DELETE.
  const headers = sessie
    ? sessieHeaders(sessie)
    : new Headers({ "X-Ontvanger": ontvanger });
  for (const naam of DOOR_TE_GEVEN) {
    const waarde = request.headers.get(naam);
    if (waarde) headers.set(naam, waarde);
  }

  let antwoord: Response;
  try {
    antwoord = await fetch(
      `${KETEN_URL}/api/v1/${pad}${request.nextUrl.search}`,
      {
        method: request.method,
        headers,
        body: ["GET", "DELETE"].includes(request.method)
          ? undefined
          : await request.text(),
        cache: "no-store",
        // Sluit de bezoeker de stroom, dan stopt het stelsel ook.
        signal: request.signal,
      },
    );
  } catch {
    return stelselOnbereikbaar();
  }

  const terug = terugHeaders(antwoord);
  // Het stelsel kent de sessie niet meer: dan hoort het cookie ook weg.
  if (antwoord.status === 401 || vanAnder)
    terug.append("set-cookie", sessieCookie(null));

  if (BIJLAGE.test(pad) && !antwoord.ok) {
    terug.set("content-type", "text/plain; charset=utf-8");
    terug.delete("content-disposition");
    return new Response(bijlageTekst(antwoord.status), {
      status: antwoord.status,
      headers: terug,
    });
  }

  return new Response(antwoord.body, {
    status: antwoord.status,
    headers: terug,
  });
};

export const GET = stuurDoor;
export const POST = stuurDoor;
export const PATCH = stuurDoor;
export const DELETE = stuurDoor;
