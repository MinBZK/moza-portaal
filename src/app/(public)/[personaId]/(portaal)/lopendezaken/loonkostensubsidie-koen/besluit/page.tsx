import { redirect } from "next/navigation";

/** Oude link naar het besluit van de gemeente. */
const BesluitPage = () =>
  redirect("/lopendezaken/iemand-aannemen/gemeente/besluit");

export default BesluitPage;
