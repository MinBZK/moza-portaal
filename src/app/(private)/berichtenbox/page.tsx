import LijstPagina, { type LijstPaginaProps } from "./_lijstPagina";

const InboxPage = (props: LijstPaginaProps) => (
  <LijstPagina weergave="inbox" {...props} />
);

export default InboxPage;
