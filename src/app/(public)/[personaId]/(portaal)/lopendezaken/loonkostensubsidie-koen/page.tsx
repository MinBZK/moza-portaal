import { redirect } from "next/navigation";

/** Oude link: de zaak staat nu per situatie; een eerdere zaak hoort bij de gemeente. */
const ZaakPage = () => redirect("/lopendezaken/iemand-aannemen/gemeente");

export default ZaakPage;
