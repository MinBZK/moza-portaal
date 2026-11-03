import type { Metadata } from "next";
import { DataSummary, DataSummaryItem } from "@/components/rhc";
import OnderdeelPagina, {
  type OnderdeelPaginaProps,
} from "../_onderdeelPagina";

export const metadata: Metadata = { title: "Adresgegevens - Bedrijfsgegevens" };

const AdresgegevensPage = (props: OnderdeelPaginaProps) => (
  <OnderdeelPagina
    {...props}
    id="adresgegevens"
    inhoud={({ vestigingsadres, postadres }) => (
      <DataSummary appearance="column">
        {vestigingsadres && (
          <DataSummaryItem
            itemKey="Vestigingsadres"
            itemValue={vestigingsadres}
          />
        )}
        {postadres && (
          <DataSummaryItem itemKey="Postadres" itemValue={postadres} />
        )}
      </DataSummary>
    )}
  />
);

export default AdresgegevensPage;
