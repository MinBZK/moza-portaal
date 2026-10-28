import type { NextRequest } from "next/server";

/**
 * Doorgeefluik naar de backend van de Digitale assistent
 * (github.com/MinBZK/moza-poc-digitale-assistent), zoals de nginx-proxy in
 * moza-poc. Zo praat de browser alleen met dit portaal: geen CORS en geen
 * backend-adres in de browser. Het adres staat in ASSISTENT_BACKEND_URL.
 * Zonder dat adres antwoordt dit met 503; de chat stelt dan de demo-modus voor.
 */

// De backend streamt (Server-Sent Events): niet bufferen of cachen.
export const dynamic = "force-dynamic";

const DOOR_TE_GEVEN = [
  "content-type",
  "accept",
  "x-test-user",
  "x-vlam-api-key",
  "x-claude-api-key",
];

// Alleen de paden die de chat en de uitleg in gewone taal gebruiken.
const TOEGESTAAN =
  /^(chat|chat\/stream|health|tools|regelrecht\/definities|uitleg)$/;

const stuurDoor = async (
  request: NextRequest,
  { params }: { params: Promise<{ pad: string[] }> },
) => {
  const basis = process.env.ASSISTENT_BACKEND_URL?.replace(/\/$/, "");
  if (!basis)
    return Response.json(
      {
        fout: "De digitale assistent is niet ingesteld. Vraag de beheerder om de assistent aan te zetten.",
      },
      { status: 503 },
    );

  const pad = (await params).pad.join("/");
  if (!TOEGESTAAN.test(pad))
    return Response.json({ fout: "Onbekend pad." }, { status: 404 });

  const headers = new Headers();
  for (const naam of DOOR_TE_GEVEN) {
    const waarde = request.headers.get(naam);
    if (waarde) headers.set(naam, waarde);
  }

  try {
    const antwoord = await fetch(`${basis}/${pad}${request.nextUrl.search}`, {
      method: request.method,
      headers,
      body: request.method === "GET" ? undefined : await request.text(),
      cache: "no-store",
    });
    return new Response(antwoord.body, {
      status: antwoord.status,
      headers: {
        "content-type":
          antwoord.headers.get("content-type") ?? "application/json",
        "cache-control": "no-cache, no-transform",
        "x-accel-buffering": "no",
      },
    });
  } catch {
    return Response.json(
      {
        fout: "De digitale assistent werkt nu niet. Probeer het later opnieuw.",
      },
      { status: 502 },
    );
  }
};

export const GET = stuurDoor;
export const POST = stuurDoor;
