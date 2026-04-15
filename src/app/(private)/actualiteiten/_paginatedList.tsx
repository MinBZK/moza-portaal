"use client";

import { useState, type ReactNode } from "react";

export type QueryStatus = "pending" | "error" | "success";

const LOADING_MESSAGE = "Laden...";
const ERROR_MESSAGE = "Er ging iets mis bij het laden. Probeer het later opnieuw.";

const PaginatedList = <T,>({
  items,
  status,
  pageSize = 10,
  emptyMessage = "Geen resultaten gevonden.",
  getKey,
  renderItem,
  containerClassName = "space-y-6",
  listClassName = "divide-y divide-neutral-200",
}: {
  items: T[];
  status: QueryStatus;
  pageSize?: number;
  emptyMessage?: string;
  getKey: (item: T, index: number) => string;
  renderItem: (item: T) => ReactNode;
  containerClassName?: string;
  listClassName?: string;
}) => {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [prevItems, setPrevItems] = useState(items);
  if (items !== prevItems) {
    setPrevItems(items);
    setVisibleCount(pageSize);
  }

  if (status === "pending") {
    return <p className="text-sm text-neutral-600">{LOADING_MESSAGE}</p>;
  }
  if (status === "error") {
    return <p className="text-sm text-red-600">{ERROR_MESSAGE}</p>;
  }
  if (items.length === 0) {
    return <p className="text-sm text-neutral-600">{emptyMessage}</p>;
  }

  const visible = items.slice(0, visibleCount);

  return (
    <div className={containerClassName}>
      <div className={listClassName}>
        {visible.map((item, i) => (
          <div key={getKey(item, i)}>{renderItem(item)}</div>
        ))}
      </div>
      {visibleCount < items.length && (
        <button
          onClick={() => setVisibleCount((c) => c + pageSize)}
          className="rounded bg-[#154273] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0e2f54]"
        >
          Meer laden
        </button>
      )}
    </div>
  );
};

export default PaginatedList;
