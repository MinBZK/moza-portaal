"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "@/components/rhc";
import PageNumberNavigation from "@/components/pageNumberNavigation";
import SortableHeaderCell, {
  nextSorting,
  type Sorting,
} from "@/components/SortableHeaderCell";
import type { DemoVerwerking } from "@/demo";

const PAGE_SIZE = 10;

type SortKey = "organisatie" | "tijdstip";

// Times in Dutch time, also when the server runs in UTC.
const dateTime = new Intl.DateTimeFormat("nl-NL", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Amsterdam",
});

const ActivityLog = ({
  entries,
  page,
}: {
  entries: DemoVerwerking[];
  page: number;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  // The log arrives newest first.
  const [sorting, setSorting] = useState<Sorting<SortKey> | null>({
    key: "tijdstip",
    ascending: false,
  });

  const sorted = sorting
    ? [...entries].sort(
        (a, b) =>
          (sorting.ascending ? 1 : -1) *
            a[sorting.key].localeCompare(b[sorting.key], "nl") ||
          b.tijdstip.localeCompare(a.tijdstip),
      )
    : entries;

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const visible = sorted.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const sort = (key: SortKey) => {
    setSorting((current) => nextSorting(current, key));
    if (currentPage !== 1) router.replace(pathname, { scroll: false });
  };

  return (
    <>
      <div className="rhc-mox-table-container">
        <Table>
          <caption className="rhc-visually-hidden">
            Activiteitenlogboek, pagina {currentPage} van {totalPages}
          </caption>
          <TableHeader>
            <TableRow>
              <SortableHeaderCell
                sortKey="organisatie"
                sorting={sorting}
                onSort={sort}
              >
                Organisatie
              </SortableHeaderCell>
              <SortableHeaderCell
                sortKey="tijdstip"
                sorting={sorting}
                onSort={sort}
              >
                Datum en tijd
              </SortableHeaderCell>
              <TableHeaderCell scope="col">Gegevens</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map(({ id, organisatie, tijdstip, gegevens }) => (
              <TableRow key={id}>
                <TableCell>{organisatie}</TableCell>
                <TableCell>
                  <time dateTime={tijdstip}>
                    {dateTime.format(new Date(tijdstip))}
                  </time>
                </TableCell>
                <TableCell>
                  <ul>
                    {gegevens.map(({ soort, waarde }) => (
                      <li key={soort}>
                        {soort}: {waarde}
                      </li>
                    ))}
                  </ul>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <PageNumberNavigation
          page={currentPage}
          totalPages={totalPages}
          maxVisiblePages={7}
        />
      )}
    </>
  );
};

export default ActivityLog;
