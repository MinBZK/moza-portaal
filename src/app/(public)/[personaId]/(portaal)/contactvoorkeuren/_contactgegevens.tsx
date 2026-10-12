"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Alert, Paragraph } from "@rijkshuisstijl-community/components-react";
import { AanhefEditBox } from "@/app/(private)/contactgegevens/[type]/_aanhefEditBox";
import { ContactEditBox } from "@/app/(private)/contactgegevens/[type]/_contactEditBox";
import { TaalEditBox } from "@/app/(private)/contactgegevens/[type]/_taalEditBox";
import { useGetProfielInformation } from "@/network/profiel/hooks/getProfielInformation/useGetProfielInformation";
import type { DemoProfielIdentiteit } from "@/demo";

/**
 * Contactgegevens uit de profielservice, met wijzigen en het verifiëren van
 * het e-mailadres. Zoals de island "contactgegevens" in moza-poc; de
 * bewerkvelden zijn dezelfde als in (private)/contactgegevens.
 */
const Lijst = ({
  identificatieType,
  identificatieNummer,
}: DemoProfielIdentiteit) => {
  const { data, status } = useGetProfielInformation(
    identificatieType,
    identificatieNummer,
  );

  if (status === "pending")
    return (
      <Paragraph role="status">Uw contactgegevens worden geladen.</Paragraph>
    );

  if (status === "error" || (data.status >= 500 && data.status !== 404))
    return (
      <Alert type="error">
        <Paragraph>
          Uw contactgegevens kunnen nu niet worden opgehaald. Probeer het later
          opnieuw.
        </Paragraph>
      </Alert>
    );

  const gegevens = data.data;
  const email = gegevens?.contactgegevens?.find(({ type }) => type === "Email");
  const telefoon = gegevens?.contactgegevens?.find(
    ({ type }) => type === "Telefoonnummer",
  );
  const aanhef = gegevens?.voorkeuren?.find(
    ({ voorkeurType }) => voorkeurType === "Aanhef",
  );
  const taal = gegevens?.voorkeuren?.find(
    ({ voorkeurType }) => voorkeurType === "WebsiteTaal",
  );
  const iden = { idenType: identificatieType, idenValue: identificatieNummer };

  return (
    <div>
      <AanhefEditBox voorkeur={aanhef} {...iden} />
      <TaalEditBox voorkeur={taal} {...iden} />
      <ContactEditBox
        name="Email"
        label="E-mailadres"
        contactGegeven={email}
        {...iden}
      />
      <ContactEditBox
        name="Telefoonnummer"
        label="Telefoonnummer"
        contactGegeven={telefoon}
        {...iden}
      />
    </div>
  );
};

const Contactgegevens = (props: DemoProfielIdentiteit) => {
  // De publieke layout heeft geen QueryClient; deze lijst krijgt een eigen.
  const [client] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={client}>
      <Lijst {...props} />
    </QueryClientProvider>
  );
};

export default Contactgegevens;
