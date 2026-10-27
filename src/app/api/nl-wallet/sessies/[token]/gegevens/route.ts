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
        { fout: "Geen naam ontvangen uit de NL Wallet" },
        { status: 422 },
      );
    await logInMetWallet(inlog);
    return Response.json(inlog);
  } catch (fout) {
    console.error("[nl-wallet]", fout);
    return Response.json(
      { fout: "De gegevens uit de NL Wallet zijn niet op te halen" },
      { status: 502 },
    );
  }
};
