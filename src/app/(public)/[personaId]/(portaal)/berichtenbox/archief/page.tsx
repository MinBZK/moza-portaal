import type { Metadata } from "next";
import LijstPagina, { type LijstPaginaProps } from "../_lijstPagina";

export const metadata: Metadata = { title: "Archief - Berichtenbox" };

const ArchiefPage = (props: LijstPaginaProps) => (
  <LijstPagina weergave="archief" {...props} />
);

export default ArchiefPage;
