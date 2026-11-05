import { redirect } from "next/navigation";

/** Het kruimelpad linkt hierheen; er is geen lijst met aanvragen meer. */
const AanvragenPage = () => redirect("/lopendezaken");

export default AanvragenPage;
