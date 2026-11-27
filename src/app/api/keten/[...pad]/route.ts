import type { NextRequest } from "next/server";
import { getKetenAccount } from "@/app/(public)/_persona";
import { KETEN_URL, ketenOntvanger } from "@/network/keten";
import {
  beeindigBijStelsel,
  leesSessie,
  logStelselFout,
  SESSIE_COOKIE,
  sessieCookie,
  sessieHeaders,
  startBijStelsel,
} from "@/network/keten/sessie";

/**
 * Doorgeefluik naar het Federatief Berichtenstelsel, zoals nginx en
 * keten-proxy.js in moza-poc. Anders dan daar bepaalt de server de ontvanger,
 * uit het persona-cookie, en houdt hij het sessie-id bij zich: de browser ziet
 * het geheim niet. Welke ontvanger dat is, kiest in deze demo de persona; een
 * echte inlogdienst hoort die plaats in te nemen.
 */

// Ophalen en volgen zijn Server-Sent Events: niet bufferen of cachen.
export const dynamic = "force-dynamic";

const ID = "[0-9a-fA-F-]{36}";

/** Wat de berichtenbox gebruikt, per pad en methode. Al het andere is 404. */
const TOEGESTAAN: [RegExp, string[]][] = [
  [/^berichten$/, ["GET"]],
  [/^berichten\/_ophalen$/, ["GET"]],
  [/^berichten\/_volgen$/, ["GET"]],
  [new RegExp(`^berichten/${ID}$`), ["GET", "PATCH", "DELETE"]],
  [new RegExp(`^berichten/${ID}/bijlagen/${ID}$`), ["GET"]],
];
const BIJLAGE = new RegExp(`^berichten/${ID}/bijlagen/${ID}$`);

const DOOR_TE_GEVEN = ["accept", "content-type"];
const TERUG_TE_GEVEN = [
  "content-type",
  "content-disposition",
  "content-security-policy",
  "x-content-type-options",
  "retry-after",
];
// Wat een browser zelf mag tonen; de rest van de bijlagen komt als download.
const ZELF_TE_TONEN = new Set(["application/pdf", "image/png", "image/jpeg"]);
// Altijd, naast wat het stelsel zelf stuurt: twee policies gelden allebei.
const BIJLAGE_CSP =
  "default-src 'none'; img-src 'self'; object-src 'self'; frame-ancestors 'self'; base-uri 'none'; form-action 'none'";

const ONGELDIG = {
  type: "urn:fbs:fout:sessie-ongeldig",
  title: "Unauthorized",
  status: 401,
  detail: "Er is geen sessie bij het stelsel.",
};

const probleem = (lichaam: object, status: number) =>
  new Response(JSON.stringify(lichaam), {
    status,
    headers: { "content-type": "application/problem+json" },
  });

// Een bijlage opent in een eigen tabblad; daar hoort een leesbare pagina.
const bijlagePagina = (status: number) => {
  const tekst =
    status === 401
      ? "U was een tijd niet actief. Ga terug naar het tabblad met het bericht en open de bijlage opnieuw."
      : status === 404 || status === 410
        ? "Deze bijlage bestaat niet meer. Neem contact op met de organisatie die het bericht stuurde."
        : status === 429 || status === 503
          ? "Wij kunnen deze bijlage nu niet ophalen. Probeer het over een minuut opnieuw."
          : "Wij kunnen deze bijlage nu niet ophalen. Probeer het later opnieuw.";
  return `<!doctype html><html lang="nl"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Bijlage niet beschikbaar</title><h1>Bijlage niet beschikbaar</h1><p>${tekst}</p></html>`;
};

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

/**
 * De inhoud van een bijlage komt van een organisatie en is dus niet te
 * vertrouwen. Wat het stelsel ook stuurt: nooit raden naar het type, geen
 * scripts, en alleen pdf en plaatjes in de browser tonen.
 */
const beveiligBijlage = (terug: Headers) => {
  terug.set("x-content-type-options", "nosniff");
  terug.append("content-security-policy", BIJLAGE_CSP);
  // Eén type, zonder parameters; twee types (een komma) is geen type.
  const ruw = terug.get("content-type") ?? "";
  const type = ruw.includes(",") ? "" : ruw.split(";")[0].trim().toLowerCase();
  terug.set("content-type", type || "application/octet-stream");
  if (!ZELF_TE_TONEN.has(type)) {
    const naam = terug
      .get("content-disposition")
      ?.match(/filename\*?=[^;]+/)?.[0];
    terug.set(
      "content-disposition",
      naam ? `attachment; ${naam}` : "attachment",
    );
  }
};

const stelselOnbereikbaar = () =>
  Response.json(
    {
      fout: "Wij kunnen uw berichten nu niet ophalen. Probeer het later opnieuw.",
    },
    { status: 502 },
  );

const wisCookie = () => ({ "set-cookie": sessieCookie(null) });

/**
 * Start een sessie. Een vorige sessie van deze browser stopt pas als de nieuwe
 * er is: zo laat een traag stelsel geen cookie achter dat naar een beëindigde
 * sessie wijst. Het antwoord noemt het sessie-id niet.
 */
const startSessie = async (ontvanger: string) => {
  let uitkomst;
  try {
    uitkomst = await startBijStelsel(ontvanger);
  } catch (fout) {
    logStelselFout("sessie starten", fout);
    return stelselOnbereikbaar();
  }
  if (!("sessie" in uitkomst)) {
    const headers = new Headers();
    if (uitkomst.wacht) headers.set("retry-after", uitkomst.wacht);
    return new Response(null, { status: uitkomst.status, headers });
  }
  // De vorige sessie stoppen wij niet: de browser start alleen een nieuwe als het
  // stelsel de vorige niet meer kende, en een ander tabblad kan het cookie
  // intussen op een nieuwere gezet hebben.
  return new Response(null, {
    status: 201,
    headers: { "set-cookie": sessieCookie(uitkomst.sessie) },
  });
};

// Wat de route van een sessie teruggeeft: nooit meer dan hoe lang ze geldt.
const geldigheid = async (antwoord: Response) => {
  const lichaam = (await antwoord.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;
  return Response.json(
    {
      geldigTot: lichaam.geldigTot,
      uiterlijkGeldigTot: lichaam.uiterlijkGeldigTot,
    },
    { status: antwoord.status },
  );
};

const sessiePad = (pad: string, methode: string) =>
  (pad === "sessies" && methode === "POST") ||
  (pad === "sessies/huidige" && (methode === "GET" || methode === "DELETE")) ||
  (pad === "sessies/huidige/_verlengen" && methode === "POST");

const stuurDoor = async (
  request: NextRequest,
  { params }: { params: Promise<{ pad: string[] }> },
) => {
  const pad = (await params).pad.join("/");
  // HEAD alleen voor een bijlage, als GET zonder lichaam. Op een stroom zou HEAD
  // een plek bij het stelsel bezet houden.
  const isHead = request.method === "HEAD";
  if (isHead && !BIJLAGE.test(pad)) return new Response(null, { status: 405 });
  const methode = isHead ? "GET" : request.method;
  const isSessiePad = sessiePad(pad, methode);
  if (
    !isSessiePad &&
    !TOEGESTAAN.some(
      ([patroon, methodes]) => patroon.test(pad) && methodes.includes(methode),
    )
  )
    return Response.json({ fout: "Onbekend pad." }, { status: 404 });

  // Alleen vanaf deze site zelf, ook niet vanaf een buur-subdomein (andere apps
  // op hetzelfde domein zijn same-site). Een bijlage mag ook rechtstreeks in de
  // adresbalk geopend worden.
  const herkomst = request.headers.get("sec-fetch-site");
  const rechtstreeks =
    herkomst === "none" &&
    BIJLAGE.test(pad) &&
    request.headers.get("sec-fetch-mode") === "navigate";
  if (herkomst && herkomst !== "same-origin" && !rechtstreeks)
    return Response.json({ fout: "Niet toegestaan." }, { status: 403 });

  const opgeslagen = leesSessie(request.cookies.get(SESSIE_COOKIE)?.value);

  // Beëindigen kan ook als de persona intussen geen berichten meer heeft.
  if (pad === "sessies/huidige" && methode === "DELETE") {
    if (opgeslagen) await beeindigBijStelsel(opgeslagen);
    return new Response(null, { status: 204, headers: wisCookie() });
  }

  const ontvanger = ketenOntvanger(await getKetenAccount());
  if (!ontvanger)
    return Response.json(
      { fout: "Deze persona heeft geen berichten. Kies een andere persona." },
      { status: 403 },
    );

  // Een sessie van een vorige persona hoort niet bij deze ontvanger.
  const sessie = opgeslagen?.ontvanger === ontvanger ? opgeslagen : null;
  const vanAnder = opgeslagen && !sessie ? opgeslagen : null;
  if (vanAnder) void beeindigBijStelsel(vanAnder);

  if (pad === "sessies") return startSessie(ontvanger);

  if (isSessiePad && !sessie) {
    const antwoord = probleem(ONGELDIG, 401);
    if (vanAnder)
      antwoord.headers.append("set-cookie", wisCookie()["set-cookie"]);
    return antwoord;
  }

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
        method: methode,
        headers,
        body: methode === "PATCH" ? await request.text() : undefined,
        cache: "no-store",
        // Een omleiding nam X-Sessie mee naar een ander adres.
        redirect: "error",
        // Sluit de bezoeker de stroom, dan stopt het stelsel ook.
        signal: request.signal,
      },
    );
  } catch (fout) {
    if (!request.signal.aborted) logStelselFout(`${methode} ${pad}`, fout);
    return stelselOnbereikbaar();
  }

  // Bij een 401 blijft het cookie staan: een ander tabblad kan het intussen op
  // een nieuwe sessie gezet hebben, en de volgende start overschrijft het toch.
  if (isSessiePad) {
    const lichaam = await geldigheid(antwoord);
    if (vanAnder) lichaam.headers.append("set-cookie", sessieCookie(null));
    return lichaam;
  }

  const terug = terugHeaders(antwoord);
  if (vanAnder) terug.append("set-cookie", sessieCookie(null));

  if (BIJLAGE.test(pad)) {
    if (!antwoord.ok) {
      await antwoord.body?.cancel();
      terug.set("content-type", "text/html; charset=utf-8");
      terug.delete("content-disposition");
      terug.set("x-content-type-options", "nosniff");
      return new Response(bijlagePagina(antwoord.status), {
        status: antwoord.status,
        headers: terug,
      });
    }
    beveiligBijlage(terug);
  }

  if (isHead) await antwoord.body?.cancel();
  return new Response(isHead ? null : antwoord.body, {
    status: antwoord.status,
    headers: terug,
  });
};

export const GET = stuurDoor;
export const HEAD = stuurDoor;
export const POST = stuurDoor;
export const PATCH = stuurDoor;
export const DELETE = stuurDoor;
