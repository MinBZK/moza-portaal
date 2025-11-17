import profielClient from "@/network/profiel";
import { getKvkFromCookie } from "@/utils/kvknummer";
import { EmailCard } from "./emailCard";
import ProfielHistoryPicker from "./profielHistoryPicker";
import ProfielEvents from "./profielEvents";
import { Heading } from "@rijkshuisstijl-community/components-react";

const InstellingenPage = async () => {
  const kvk = await getKvkFromCookie();
  const { data: profiel, response } = await profielClient.GET(
    "/ondernemingen/{kvkNummer}",
    {
      params: { path: { kvkNummer: kvk! } },
    },
  );

  if (!profiel || response.status != 200) {
    throw new Error("Server-side error occurred");
  }

  return (
    <>
      <Heading level={1}>Instellingen</Heading>
      <EmailCard
        currentEmail={profiel.Onderneming.email!}
        kvkNummer={kvk!}
        emailVerified={profiel.Onderneming.emailVerified!}
      />
      <ProfielEvents kvkNummer={kvk!} />
      <ProfielHistoryPicker kvkNummer={kvk!} />
    </>
  );
};

export default InstellingenPage;
