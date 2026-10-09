import { DataSummary, DataSummaryItem } from "@/components/rhc";
import type { DemoWet } from "@/demo";

/** Kerngegevens van een regel. Labels zoals in moza-poc. */
const WetGegevens = ({
  wet,
  detail = false,
}: {
  wet: DemoWet;
  detail?: boolean;
}) => (
  <DataSummary appearance="column">
    <DataSummaryItem itemKey="Bron" itemValue={wet.bron} />
    <DataSummaryItem
      itemKey={detail ? "Inwerkingtreding" : "In werking"}
      itemValue={wet.ingangsdatum}
    />
    <DataSummaryItem itemKey="Geldt voor" itemValue={wet.voorWie} />
  </DataSummary>
);

export default WetGegevens;
