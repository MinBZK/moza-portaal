import type { Metadata } from "next";
import LijstPagina, { type LijstPaginaProps } from "../_lijstPagina";

export const metadata: Metadata = { title: "Prullenbak - Berichtenbox" };

const PrullenbakPage = (props: LijstPaginaProps) => (
  <LijstPagina weergave="prullenbak" {...props} />
);

export default PrullenbakPage;
