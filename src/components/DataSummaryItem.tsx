import type { ComponentProps } from "react";
import Link from "next/link";
import { DataSummaryItem as RhcDataSummaryItem } from "@rijkshuisstijl-community/components-react/no-side-effects";

/**
 * RHC DataSummaryItem with `keyHref`: the name becomes a link (next/link).
 * The RHC item only takes text as name; with `keyHref` this renders the same
 * markup and classes itself.
 */
export const DataSummaryItem = ({
  keyHref,
  ...props
}: ComponentProps<typeof RhcDataSummaryItem> & {
  /** The name links here. */
  keyHref?: string;
}) => {
  if (!keyHref) return <RhcDataSummaryItem {...props} />;
  const { itemKey, itemValue, className } = props;
  return (
    <div
      className={`rhc-data-summary__item${className ? ` ${className}` : ""}`}
    >
      <dt className="rhc-data-summary__item-key">
        <Link href={keyHref} className="utrecht-link utrecht-link--html-a">
          {itemKey}
        </Link>
      </dt>
      <dd className="rhc-data-summary__item-value">{itemValue}</dd>
    </div>
  );
};
