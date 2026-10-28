import type { NextRequest } from "next/server";
import {
  haalGegevensOp,
  inlogUitGegevens,
  nlWalletConfig,
} from "@/network/nl-wallet";
import { logInMetWallet } from "../../../_inloggen";

/** Na een geslaagde sessie: naam en bevoegdheid, en de persona wordt gezet. */
export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) => {
  const { token } = await params;
  try {
    const inlog = inlogUitGegevens(
      await haalGegevensOp(
        nlWalletConfig(),
        token,
        request.nextUrl.searchParams.get("nonce"),
      ),
    );
    if (!inlog)
      return Response.json(
        { fout: "NL Wallet heeft uw naam niet gedeeld. Probeer het opnieuw." },
        { status: 422 },
      );
    await logInMetWallet(inlog);
    return Response.json(inlog);
  } catch (fout) {
    console.error("[nl-wallet]", fout);
    return Response.json(
      {
        fout: "Wij kunnen uw gegevens uit NL Wallet niet ophalen. Probeer het opnieuw.",
      },
      { status: 502 },
    );
  }
};
