import { redirect } from "next/navigation";

/** De zaken van "Iemand aannemen" staan per situatie; deze map zelf heeft geen pagina. */
const IemandAannemenPage = () => redirect("/lopendezaken");

export default IemandAannemenPage;
