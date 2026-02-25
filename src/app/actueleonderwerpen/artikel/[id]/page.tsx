import Card from "@/components/card";
import dopOpenDataClient from "@/network/dop/opendata";
import { notFound } from "next/navigation";

const ArtikelSlugPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  const { data: article, error } = await dopOpenDataClient.GET(
    "/api/articles/{id}",
    {
      params: {
        path: { id },
      },
    },
  );

  if (error || !article) {
    notFound();
  }

  return (
    <>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 w-full space-y-5 md:col-span-8">
          <Card className="space-y-5">
            <div className="flex items-center gap-4 text-sm text-neutral-600">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl">{article.headLine}</h1>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-4 text-sm text-neutral-600">
                    {article.datePublished && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Gepubliceerd:</span>
                        <time dateTime={article.datePublished}>
                          {new Date(article.datePublished).toLocaleDateString(
                            "nl-NL",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            },
                          )}
                        </time>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Laatst gewijzigd:</span>
                      <time dateTime={article.dateModified!}>
                        {new Date(article.dateModified!).toLocaleDateString(
                          "nl-NL",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          },
                        )}
                      </time>
                    </div>
                  </div>
                  {article.author && article.author.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                      <span className="font-medium">
                        {article.author.length > 1 ? "Auteurs:" : "Auteur:"}
                      </span>
                      <span>
                        {article.author
                          .map((author) => author.name)
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: article.articleBody || "" }}
            />
          </Card>
        </div>
      </div>
    </>
  );
};

export default ArtikelSlugPage;
