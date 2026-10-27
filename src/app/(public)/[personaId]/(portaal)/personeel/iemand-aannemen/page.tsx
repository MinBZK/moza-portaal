import { redirect } from "next/navigation";

/**
 * De flow begint bij de bewaarde aanvraag onder Lopende zaken; deze oude
 * ingang (menu Personeel, oude links) verwijst daarheen.
 */
const IemandAannemenPage = () =>
  redirect("/lopendezaken/aanvragen/iemand-aannemen-met-afstand-tot-de-arbeidsmarkt");

export default IemandAannemenPage;
