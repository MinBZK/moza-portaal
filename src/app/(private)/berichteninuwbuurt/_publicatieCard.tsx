import Link from "next/link";
import type { components } from "@/network/actualiteiten/generated";

type SruPublicatie = components["schemas"]["SruPublicatie"];

const isReadableUrl = (url: string) =>
  url && !url.endsWith(".xml") && !url.includes("/metadata/");

const PublicatieCard = ({ publicatie }: { publicatie: SruPublicatie }) => {
  const date = publicatie.modified
    ? new Date(publicatie.modified).toLocaleDateString("nl-NL", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const externalUrl = isReadableUrl(publicatie.preferredUrl ?? "")
    ? publicatie.preferredUrl ?? ""
    : publicatie.bronUrl || "";
  const hasExternalLink = !!externalUrl;
  const description = publicatie.abstract || "";
  const detailHref = `/berichteninuwbuurt/${encodeURIComponent(publicatie.id ?? "")}`;

  return (
    <div className="flex items-start justify-between gap-2 py-2">
      <div className="min-w-0">
        <h3 className="text-base font-semibold">
          <Link
            href={detailHref}
            className="text-[#01689b] underline decoration-1 underline-offset-2 hover:decoration-2"
          >
            {publicatie.title || "Onbekende titel"}
          </Link>
        </h3>
        {(date || description) && (
          <p className="mt-0.5 text-sm text-neutral-600">
            {date}
            {date && description ? " — " : ""}
            {description}
          </p>
        )}
      </div>
      {hasExternalLink && (
        <a
          href={externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-0.5 flex-shrink-0 rounded p-1 text-[#01689b] hover:bg-neutral-100"
          title="Direct openen op officielebekendmakingen.nl"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path
              fillRule="evenodd"
              d="M4.25 5.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 1 1.5 0v4A2.25 2.25 0 0 1 12.75 17h-8.5A2.25 2.25 0 0 1 2 14.75v-8.5A2.25 2.25 0 0 1 4.25 4h5a.75.75 0 0 1 0 1.5h-5Z"
              clipRule="evenodd"
            />
            <path
              fillRule="evenodd"
              d="M6.194 12.753a.75.75 0 0 0 1.06.053L16.5 4.44v2.81a.75.75 0 0 0 1.5 0v-4.5a.75.75 0 0 0-.75-.75h-4.5a.75.75 0 0 0 0 1.5h2.553l-9.056 8.194a.75.75 0 0 0-.053 1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </a>
      )}
    </div>
  );
};

export default PublicatieCard;
