import { redirect } from "next/navigation";

/**
 * Versturen staat onderaan stap 2 (Controleren en dossier indienen), zonder aparte
 * pagina. Oude links komen daar uit.
 */
const VersturenPage = () => {
  redirect("/personeel/iemand-aannemen/concept-aanvraag#versturen");
};

export default VersturenPage;
