import type { Metadata } from "next";
import ContactvoorkeurenPagina from "./_pagina";

export const metadata: Metadata = { title: "Zakelijk - Contactvoorkeuren" };

const ContactvoorkeurenPage = () => (
  <ContactvoorkeurenPagina soort="zakelijk" />
);

export default ContactvoorkeurenPage;
