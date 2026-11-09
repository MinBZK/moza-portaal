import { redirect } from "next/navigation";

/**
 * Iemand aannemen begint bij de voorbeeldberekening. Wat er kan, staat nu in
 * die stap. Links naar het begin van de taak komen daar uit.
 */
const IemandAannemenPage = () => {
  redirect("/personeel/iemand-aannemen/voorbeeldberekening");
};

export default IemandAannemenPage;
