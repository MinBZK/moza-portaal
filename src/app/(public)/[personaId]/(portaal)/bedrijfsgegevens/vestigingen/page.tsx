import { DataSummary, DataSummaryItem, Heading } from "@/components/rhc";
import OnderdeelPagina, {
  type OnderdeelPaginaProps,
} from "../_onderdeelPagina";

const VestigingenPage = (props: OnderdeelPaginaProps) => (
  <OnderdeelPagina
    {...props}
    id="vestigingen"
    inhoud={({ vestigingen }) =>
      vestigingen.map(({ nummer, type, adres }) => (
        <div key={nummer}>
          <Heading level={3}>{type}</Heading>
          <DataSummary appearance="column">
            <DataSummaryItem itemKey="Vestigingsnummer" itemValue={nummer} />
            <DataSummaryItem itemKey="Adres" itemValue={adres} />
          </DataSummary>
        </div>
      ))
    }
  />
);

export default VestigingenPage;
