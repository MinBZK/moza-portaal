import profielClient from "@/network/profiel";
import { getKvkFromCookie } from "@/utils/kvknummer";
import { EmailCard } from "./emailCard";
import ProfielHistoryPicker from "./profielHistoryPicker";
import ProfielEvents from "./profielEvents";

const InstellingenPage = async () => {
  const kvk = await getKvkFromCookie();
  const { data, response } = await profielClient.GET(
    "/api/profielservice/v1/{identificatieType}/{identificatieNummer}",
    {
      params: { path: { identificatieType: "KVK", identificatieNummer: kvk! } },
    },
  );

  if (!data || response.status != 200) {
    throw new Error("Server-side error occurred");
  }

  return (
    <>
      <h1 className="text-h1">Instellingen</h1>
      <EmailCard
        currentEmail={data.contactgegevens![0].waarde ?? ""}
        id={data.contactgegevens![0].id}
        kvkNummer={kvk!}
        emailVerified={data.contactgegevens![0].isGeverifieerd ?? false}
      />
      {/*<ProfielEvents kvkNummer={kvk!} />*/}
      {/*<ProfielHistoryPicker kvkNummer={kvk!} />*/}
    </>
  );
};

export default InstellingenPage;
