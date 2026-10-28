"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Alert, Paragraph } from "@/components/rhc";
import { ContactDetails } from "@/app/(private)/contactgegevens/[type]/_contactDetails";
import { useGetProfielInformation } from "@/network/profiel/hooks/getProfielInformation/useGetProfielInformation";
import type { DemoProfielIdentiteit } from "@/demo";

/**
 * Contactgegevens uit de profielservice, met wijzigen en het verifiëren van
 * het e-mailadres. Zoals de island "contactgegevens" in moza-poc; de
 * gegevens en het bewerken zijn dezelfde als in (private)/contactgegevens.
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
      <Paragraph role="status">Wij halen uw contactgegevens op.</Paragraph>
    );

  if (status === "error" || (data.status >= 500 && data.status !== 404))
    return (
      <Alert type="error">
        <Paragraph>
          Wij kunnen uw contactgegevens nu niet ophalen. Probeer het later
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
    <ContactDetails
      {...iden}
      salutation={aanhef}
      language={taal}
      email={email}
      phone={telefoon}
    />
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
