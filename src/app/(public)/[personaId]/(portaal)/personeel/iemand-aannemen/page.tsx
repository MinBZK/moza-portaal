import { redirect } from "next/navigation";

/**
 * De flow begint bij de eerste stap met de vier vragen; deze ingang (menu
 * Personeel, oude links) verwijst daarheen.
 */
const IemandAannemenPage = () =>
  redirect(
    "/lopendezaken/aanvragen/iemand-aannemen-met-afstand-tot-de-arbeidsmarkt",
  );

export default IemandAannemenPage;
