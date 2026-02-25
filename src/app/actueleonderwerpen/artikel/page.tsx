import Card from "@/components/card";
import dopOpenDataClient from "@/network/dop/opendata";
import Link from "next/link";

const ITEMS_PER_PAGE = 20;

const ArtikelPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) => {
  const { page } = await searchParams;
  const currentPage = page ? parseInt(page) : 1;
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  const { data } = await dopOpenDataClient.GET("/api/articles", {
    params: {
      query: {
        order: "modified:desc",
        limit: ITEMS_PER_PAGE, // Show more on the full list page
        offset: offset,
      },
    },
  });

  if (!data) {
    return <p>Error</p>;
  }

  const articles = data.articles;
  const pagination = data.pagination;
  const totalPages = Math.ceil((pagination?.total ?? 0) / ITEMS_PER_PAGE);

  return (
    <>
      <h1 className="text-3xl">Artikelen</h1>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 w-full space-y-5 md:col-span-8">
          <Card className="space-y-5">
            <h2 className="text-2xl">Alle artikelen</h2>
            <div className="">
              {articles && articles.length > 0 ? (
                articles.map((article) => (
                  <div
                    key={article.identifier}
                    className="group flex items-center gap-4 border-b border-neutral-200 py-3 transition-colors last:border-b-0 hover:bg-neutral-50"
                  >
                    <time
                      className="min-w-24 shrink-0 text-sm font-medium text-neutral-600"
                      dateTime={article.dateModified!}
                    >
                      {new Date(article.dateModified!).toLocaleString("nl-NL", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                    <Link
                      href={`/actueleonderwerpen/artikel/${article.identifier}`}
                      className="group-hover:text-primary text-neutral-900 transition-colors"
                    >
                      {article.headLine}
                    </Link>
                  </div>
                ))
              ) : (
                <p>Geen artikelen beschikbaar</p>
              )}
            </div>
            <div className="flex justify-end">
              <p className="text-sm text-neutral-600">
                Pagina {currentPage} van {totalPages} - Toon{" "}
                {pagination!.limit ?? 0} van {pagination?.total ?? 0} artikelen
              </p>
            </div>
            <div className="flex items-center justify-center">
              <div className="flex gap-1">
                {/* First page button */}
                {currentPage > 1 && (
                  <Link
                    href={`/actueleonderwerpen/artikel?page=1`}
                    className="rounded border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-50"
                    title="Eerste pagina"
                  >
                    &lt;&lt;
                  </Link>
                )}

                {/* Previous page button */}
                {currentPage > 1 && (
                  <Link
                    href={`/actueleonderwerpen/artikel?page=${currentPage - 1}`}
                    className="rounded border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-50"
                    title="Vorige pagina"
                  >
                    &lt;
                  </Link>
                )}

                {/* Page numbers */}
                {(() => {
                  const pageNumbers: (number | string)[] = [];
                  const showRange = 3; // Show 3 pages before and after current

                  const startPage = Math.max(1, currentPage - showRange);
                  const endPage = Math.min(totalPages, currentPage + showRange);

                  // Add ellipsis at start if needed
                  if (startPage > 1) {
                    pageNumbers.push("start-ellipsis");
                  }

                  // Add page numbers
                  for (let i = startPage; i <= endPage; i++) {
                    pageNumbers.push(i);
                  }

                  // Add ellipsis at end if needed
                  if (endPage < totalPages) {
                    pageNumbers.push("end-ellipsis");
                  }

                  return pageNumbers.map((pageNum, index) => {
                    if (typeof pageNum === "string") {
                      return (
                        <span
                          key={pageNum}
                          className="px-3 py-2 text-sm text-neutral-400"
                        >
                          ...
                        </span>
                      );
                    }

                    if (pageNum === currentPage) {
                      return (
                        <span
                          key={pageNum}
                          className="border-primary bg-primary rounded border px-3 py-2 text-sm font-medium text-white"
                        >
                          {pageNum}
                        </span>
                      );
                    }

                    return (
                      <Link
                        key={pageNum}
                        href={`/actueleonderwerpen/artikel?page=${pageNum}`}
                        className="rounded border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-50"
                      >
                        {pageNum}
                      </Link>
                    );
                  });
                })()}

                {/* Next page button */}
                {currentPage < totalPages && (
                  <Link
                    href={`/actueleonderwerpen/artikel?page=${currentPage + 1}`}
                    className="rounded border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-50"
                    title="Volgende pagina"
                  >
                    &gt;
                  </Link>
                )}

                {/* Last page button */}
                {currentPage < totalPages && (
                  <Link
                    href={`/actueleonderwerpen/artikel?page=${totalPages}`}
                    className="rounded border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-50"
                    title="Laatste pagina"
                  >
                    &gt;&gt;
                  </Link>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ArtikelPage;
