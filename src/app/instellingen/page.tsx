import profielClient from "@/network/profiel";
import { getKvkFromCookie } from "@/utils/kvknummer";
import { EmailCard } from "./emailCard";
import ProfielHistoryPicker from "./profielHistoryPicker";
import ProfielEvents from "./profielEvents";

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
      <h1 className="text-h1">Instellingen</h1>
      <EmailCard currentEmail={profiel.Onderneming.email!} kvkNummer={kvk!} />
      <ProfielEvents kvkNummer={kvk!} />
      <ProfielHistoryPicker kvkNummer={kvk!} />
    </>
  );
};

export default InstellingenPage;
