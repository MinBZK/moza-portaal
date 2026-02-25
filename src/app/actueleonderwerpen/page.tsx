import Card from "@/components/card";
import dopOpenDataClient from "@/network/dop/opendata";
import Link from "next/link";

const Actueleonderwerpen = async () => {
  const { data } = await dopOpenDataClient.GET("/api/articles", {
    params: {
      query: {
        order: "modified:desc",
        limit: 10,
      },
    },
  });

  if (!data) {
    return <p>Error</p>;
  }

  const articles = data.articles;
  const pagination = data.pagination;

  return (
    <>
      <h1 className="text-3xl">Actuele onderwerpen</h1>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 w-full space-y-5 md:col-span-8">
          <Card className="space-y-5">
            <h2 className="text-2xl">Artikelen</h2>
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
            <div className="flex items-center justify-between">
              <Link
                href="/actueleonderwerpen/artikel"
                className="text-primary hover:underline"
              >
                Bekijk alle artikelen
              </Link>
              <p className="text-sm text-neutral-600">
                Toon {pagination!.limit ?? 0} van {pagination?.total ?? 0}{" "}
                artikelen
              </p>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Actueleonderwerpen;
