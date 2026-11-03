"use client";

import { Button } from "@rijkshuisstijl-community/components-react";
import { Icon } from "@rijkshuisstijl-community/icon-react";

export type Sorting<Key extends string> = { key: Key; ascending: boolean };

/** Next sorting after a click: a new column ascending, the same column flipped. */
export const nextSorting = <Key extends string>(
  current: Sorting<Key> | null,
  key: Key,
): Sorting<Key> => ({
  key,
  ascending: current?.key === key ? !current.ascending : true,
});

const SortableHeaderCell = <Key extends string>({
  sortKey,
  sorting,
  onSort,
  children,
}: {
  sortKey: Key;
  sorting: Sorting<Key> | null;
  onSort: (key: Key) => void;
  children: string;
}) => {
  const direction =
    sorting?.key === sortKey
      ? sorting.ascending
        ? "ascending"
        : "descending"
      : "none";
  // Own <th>: TableHeaderCell of RHC does not pass aria-sort to the cell.
  return (
    <th
      scope="col"
      aria-sort={direction}
      className="utrecht-table__header-cell"
    >
      <Button
        appearance="subtle-button"
        className="utrecht-table__header-cell-button"
        onClick={() => onSort(sortKey)}
      >
        {children}
        <Icon
          icon={direction === "none" ? "arrows-sort" : `sort-${direction}`}
        />
      </Button>
    </th>
  );
};

export default SortableHeaderCell;
