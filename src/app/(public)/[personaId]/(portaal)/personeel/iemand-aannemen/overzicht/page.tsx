import { redirect } from "next/navigation";

/**
 * Stap 4 heeft één vorm, ook zonder aanvraag: Controleren en versturen.
 * Oude links naar het overzicht komen daar uit.
 */
const OverzichtPage = () => {
  redirect("/personeel/iemand-aannemen/concept-aanvraag");
};

export default OverzichtPage;
