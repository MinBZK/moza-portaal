import type { Metadata } from "next";
import ContactvoorkeurenPagina from "../_pagina";

export const metadata: Metadata = { title: "Privé - Contactvoorkeuren" };

const PrivePage = () => <ContactvoorkeurenPagina soort="prive" />;

export default PrivePage;
