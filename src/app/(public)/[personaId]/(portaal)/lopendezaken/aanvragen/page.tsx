import { redirect } from "next/navigation";

/** Het kruimelpad linkt hierheen; de aanvragen staan op Lopende zaken. */
const AanvragenPage = () => redirect("/lopendezaken#nog-in-te-dienen");

export default AanvragenPage;
