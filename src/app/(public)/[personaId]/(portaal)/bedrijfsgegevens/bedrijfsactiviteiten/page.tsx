import { DataSummary, DataSummaryItem } from "@/components/rhc";
import OnderdeelPagina, {
  type OnderdeelPaginaProps,
} from "../_onderdeelPagina";

const BedrijfsactiviteitenPage = (props: OnderdeelPaginaProps) => (
  <OnderdeelPagina
    {...props}
    id="bedrijfsactiviteiten"
    inhoud={({ sbi }) => (
      <DataSummary appearance="column">
        {sbi.map(({ code, omschrijving }) => (
          <DataSummaryItem
            key={code}
            itemKey={`SBI-code ${code}`}
            itemValue={omschrijving}
          />
        ))}
      </DataSummary>
    )}
  />
);

export default BedrijfsactiviteitenPage;
