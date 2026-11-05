import type { Metadata } from "next";
import { Heading } from "@/components/rhc";
import { getFlagsFromServerCookie } from "@/app/actions";
import {
  getActieveOrganisatie,
  getActievePersona,
} from "@/app/(public)/_persona";
import Chat from "./_chat";
import type { AssistentPersona } from "./_types";

export const metadata: Metadata = { title: "Digitale assistent (AI)" };

const DigitaleAssistentPage = async () => {
  const [persona, flags] = await Promise.all([
    getActievePersona(),
    getFlagsFromServerCookie(),
  ]);
  const organisatie = await getActieveOrganisatie(persona);
  const bedrijf = organisatie;
  const sbi = bedrijf?.sbi?.[0];

  // Alleen wat de assistent nodig heeft gaat naar de browser.
  const context: AssistentPersona = {
    id: persona?.id ?? "",
    kvkNummer: organisatie ? String(organisatie.kvkNummer ?? "onbekend") : "",
    bedrijf: {
      handelsnaam: bedrijf?.handelsnaam,
      kvkNummer: bedrijf?.kvkNummer,
      rechtsvorm: bedrijf?.rechtsvorm,
      sbi: sbi ? { code: sbi.code, omschrijving: sbi.omschrijving } : null,
      vestiging: bedrijf?.vestigingsadresVolledig ?? bedrijf?.vestigingsadres,
      startdatum: bedrijf?.startdatum,
      omzetbelastingnummer: bedrijf?.omzetbelastingnummer,
      energie: bedrijf && "energie" in bedrijf ? bedrijf.energie : null,
    },
  };

  return (
    <>
      <Heading level={1}>Digitale assistent (AI)</Heading>
      <Chat
        persona={context}
        backendIngesteld={!!process.env.ASSISTENT_BACKEND_URL}
        toonBronstatus={flags.mox_statusBronnenAssistent}
      />
    </>
  );
};

export default DigitaleAssistentPage;
