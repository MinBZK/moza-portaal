"use client";

import { useState, type ReactNode } from "react";
import { ActionGroup, Alert, Button, Paragraph } from "@/components/rhc";

export type QueryStatus = "pending" | "error" | "success";

const LOADING_MESSAGE = "Laden...";
const ERROR_MESSAGE =
  "Er ging iets mis bij het laden. Probeer het later opnieuw.";

const PaginatedList = <T,>({
  items,
  status,
  pageSize = 10,
  emptyMessage = "Geen resultaten gevonden.",
  getKey,
  renderItem,
}: {
  items: T[];
  status: QueryStatus;
  pageSize?: number;
  emptyMessage?: string;
  getKey: (item: T, index: number) => string;
  renderItem: (item: T) => ReactNode;
}) => {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [prevItems, setPrevItems] = useState(items);
  if (items !== prevItems) {
    setPrevItems(items);
    setVisibleCount(pageSize);
  }

  if (status === "pending") {
    return <Paragraph role="status">{LOADING_MESSAGE}</Paragraph>;
  }
  if (status === "error") {
    return (
      <Alert type="error">
        <Paragraph>{ERROR_MESSAGE}</Paragraph>
      </Alert>
    );
  }
  if (items.length === 0) {
    return <Paragraph>{emptyMessage}</Paragraph>;
  }

  const visible = items.slice(0, visibleCount);

  return (
    <div className="mox-row-gap">
      {visible.map((item, i) => (
        <div key={getKey(item, i)}>{renderItem(item)}</div>
      ))}
      {visibleCount < items.length && (
        <ActionGroup>
          <Button
            appearance="secondary-action-button"
            onClick={() => setVisibleCount((c) => c + pageSize)}
          >
            Meer laden
          </Button>
        </ActionGroup>
      )}
    </div>
  );
};

export default PaginatedList;
