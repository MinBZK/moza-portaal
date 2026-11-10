import Link from "next/link";

/**
 * A DataSummaryItem of RHC whose name is a link (next/link). The RHC item
 * only takes text as name; this one has the same markup and classes.
 */
const DataSummaryLinkItem = ({
  href,
  itemKey,
  itemValue,
}: {
  href: string;
  itemKey: string;
  itemValue: string;
}) => (
  <div className="rhc-data-summary__item">
    <dt className="rhc-data-summary__item-key">
      <Link href={href} className="utrecht-link utrecht-link--html-a">
        {itemKey}
      </Link>
    </dt>
    <dd className="rhc-data-summary__item-value">{itemValue}</dd>
  </div>
);

export default DataSummaryLinkItem;
