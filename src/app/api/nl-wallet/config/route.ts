import { leesOmgeving } from "@/network/nl-wallet";

export const dynamic = "force-dynamic";

/** Per onderneming de links voor "bevoegdheid toevoegen", en of de app er is. */
export const GET = async () => {
  const omgeving = await leesOmgeving();
  return Response.json({
    bevoegdheden: (omgeving.bevoegdheden ?? []).map(
      ({ id, handelsnaam, kvkNummer, same_device_ul, cross_device_ul }) => ({
        id,
        handelsnaam,
        kvkNummer,
        same_device_ul,
        cross_device_ul,
      }),
    ),
    app: { beschikbaar: Boolean(process.env.NL_WALLET_APP_URL) },
  });
};
