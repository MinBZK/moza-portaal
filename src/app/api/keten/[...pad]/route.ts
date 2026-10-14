import type { NextRequest } from "next/server";
import { getKetenAccount } from "@/app/(public)/_persona";
import { KETEN_URL, ketenOntvanger } from "@/network/keten";

/**
 * Doorgeefluik naar het Federatief Berichtenstelsel, zoals nginx en
 * keten-proxy.js in moza-poc. Anders dan daar bepaalt de server de ontvanger,
 * uit het persona-cookie. De browser kan dus geen andere ontvanger kiezen.
 */

// Ophalen en volgen zijn Server-Sent Events: niet bufferen of cachen.
export const dynamic = "force-dynamic";

// Alleen de paden die de berichtenbox gebruikt.
const TOEGESTAAN =
  /^berichten(\/_ophalen|\/_volgen|\/[\w-]+(\/bijlagen\/[\w-]+)?)?$/;

const DOOR_TE_GEVEN = ["accept", "content-type"];
const TERUG_TE_GEVEN = [
  "content-type",
  "content-disposition",
  "content-security-policy",
  "x-content-type-options",
  "retry-after",
];

const stuurDoor = async (
  request: NextRequest,
  { params }: { params: Promise<{ pad: string[] }> },
) => {
  const pad = (await params).pad.join("/");
  if (!TOEGESTAAN.test(pad))
    return Response.json({ fout: "Onbekend pad." }, { status: 404 });

  const ontvanger = ketenOntvanger(await getKetenAccount());
  if (!ontvanger)
    return Response.json(
      { fout: "Deze persona is niet aangesloten op het stelsel." },
      { status: 403 },
    );

  // Geen Origin: het CORS-filter van het stelsel weigert anders PATCH en DELETE.
  const headers = new Headers({ "X-Ontvanger": ontvanger });
  for (const naam of DOOR_TE_GEVEN) {
    const waarde = request.headers.get(naam);
    if (waarde) headers.set(naam, waarde);
  }

  try {
    const antwoord = await fetch(
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
    const terug = new Headers({
      "cache-control": "no-cache, no-transform",
      "x-accel-buffering": "no",
    });
    for (const naam of TERUG_TE_GEVEN) {
      const waarde = antwoord.headers.get(naam);
      if (waarde) terug.set(naam, waarde);
    }
    return new Response(antwoord.body, {
      status: antwoord.status,
      headers: terug,
    });
  } catch {
    return Response.json(
      { fout: "Het stelsel is niet bereikbaar." },
      { status: 502 },
    );
  }
};

export const GET = stuurDoor;
export const PATCH = stuurDoor;
export const DELETE = stuurDoor;
