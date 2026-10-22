import { DataSummary, DataSummaryItem } from "@/components/rhc";
import ProgressBar from "@/components/ProgressBar";
import type { DemoSubsidie } from "@/demo";

/** Kerngegevens van een subsidie, op het overzicht en de detailpagina. */
const SubsidieGegevens = ({ subsidie }: { subsidie: DemoSubsidie }) => (
  <DataSummary appearance="column">
    <DataSummaryItem itemKey="Verstrekker" itemValue={subsidie.verstrekker} />
    <DataSummaryItem itemKey="Type" itemValue={subsidie.type} />
    <DataSummaryItem
      itemKey="Aanvraagperiode"
      itemValue={subsidie.aanvraagperiode}
    />
    {subsidie.maximaalBedrag && (
      <DataSummaryItem
        itemKey="Maximaal bedrag"
        itemValue={subsidie.maximaalBedrag}
      />
    )}
    {subsidie.budgetVergeven !== undefined && (
      // DataSummaryItem toont alleen tekst; de balk vraagt om eigen markup.
      <div className="rhc-data-summary__item">
        <dt className="rhc-data-summary__item-key">Budget vergeven</dt>
        <dd className="rhc-data-summary__item-value rhc-mox-graph-meter">
          <ProgressBar
            label="Budget vergeven"
            value={subsidie.budgetVergeven}
            valueText={`${subsidie.budgetVergeven}% vergeven`}
          />
          <span aria-hidden="true">{subsidie.budgetVergeven}%</span>
        </dd>
      </div>
    )}
  </DataSummary>
);

export default SubsidieGegevens;
