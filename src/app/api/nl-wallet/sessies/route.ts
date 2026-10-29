import type { NextRequest } from "next/server";
import { nlWalletConfig, startSessie } from "@/network/nl-wallet";
import { zetSessie } from "../_inloggen";

/** Het adres waarop de bezoeker MOZa ziet, voor de terugkeer na inloggen. */
const publiekAdres = (request: NextRequest) => {
  if (process.env.MOZA_PUBLIC_URL) return process.env.MOZA_PUBLIC_URL;
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const protocol =
    request.headers.get("x-forwarded-proto") ??
    request.nextUrl.protocol.replace(":", "");
  return `${protocol}://${host}`;
};

/** Aangeroepen door <nl-wallet-button start-url="/api/nl-wallet/sessies">. */
export const POST = async (request: NextRequest) => {
  const config = nlWalletConfig();
  const body = (await request.json().catch(() => ({}))) as {
    usecase?: string;
  };
  if (body.usecase && body.usecase !== config.usecase)
    return Response.json({ fout: "Onbekende usecase" }, { status: 400 });

  try {
    const sessie = await startSessie(config, publiekAdres(request));
    await zetSessie(sessie.session_token);
    return Response.json(sessie);
  } catch (fout) {
    console.error("[nl-wallet]", fout);
    return Response.json(
      {
        fout: "Inloggen met NL Wallet lukt nu niet. Probeer het later opnieuw.",
      },
      { status: 502 },
    );
  }
};
