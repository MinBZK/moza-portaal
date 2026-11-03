import type { Metadata } from "next";
import LijstPagina, { type LijstPaginaProps } from "./_lijstPagina";

export const metadata: Metadata = { title: "Berichtenbox" };

const InboxPage = (props: LijstPaginaProps) => (
  <LijstPagina weergave="inbox" {...props} />
);

export default InboxPage;
