import {
  haalGegevensOp,
  haalStatusOp,
  inlogUitGegevens,
  nlWalletConfig,
} from "@/network/nl-wallet";
import { leesSessie, logInMetWallet, zetSessie } from "../_inloggen";

export const dynamic = "force-dynamic";

/**
 * De pagina volgt hiermee de lopende inlog. Is die gelukt, dan komen naam en
 * bevoegdheid meteen mee en vervalt het cookie.
 */
export const GET = async () => {
  const token = await leesSessie();
  if (!token) return Response.json({ status: "GEEN" });
  const config = nlWalletConfig();
  try {
    const status = await haalStatusOp(config, token);
    if (status === "DONE") {
      const inlog = inlogUitGegevens(
        await haalGegevensOp(config, token).catch(() => null),
      );
      if (!inlog) return Response.json({ status });
      await zetSessie(null);
      await logInMetWallet(inlog);
      return Response.json({ status, gegevens: inlog });
    }
    if (["FAILED", "CANCELLED", "EXPIRED"].includes(status))
      await zetSessie(null);
    return Response.json({ status });
  } catch (fout) {
    console.error("[nl-wallet]", fout);
    return Response.json(
      {
        fout: "Wij weten niet of het inloggen gelukt is. Probeer het opnieuw.",
      },
      { status: 502 },
    );
  }
};
