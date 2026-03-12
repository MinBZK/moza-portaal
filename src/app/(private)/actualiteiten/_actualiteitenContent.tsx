"use client";

import { type ReactNode, useState } from "react";
import Card from "@/components/card";
import VoorkeurenSidebar, {
  type SectionKey,
  SECTION_LABELS,
} from "./_voorkeurenBeheer";
import VoorkeurenTopbar from "./_voorkeurenTopbar";
import ActiveFilters from "./_activeFilters";
import ArtikelenOverzicht from "./_artikelenOverzicht";
import SubsidiesOverzicht from "./_subsidiesOverzicht";
import BerichtenOverzicht from "./_berichtenOverzicht";
import { useActualiteitenData } from "./_useActualiteitenData";
import { useSubjectCounts } from "./_useSubjectCounts";

type ViewMode = "sidebar" | "top";

const DEFAULT_SECTIONS: Record<SectionKey, boolean> = {
  berichten: true,
  informatie: true,
  regelgeving: true,
  subsidies: true,
};

const ActualiteitenContent = ({ kvkNummer }: { kvkNummer: string }) => {
  const [viewMode, setViewMode] = useState<ViewMode>("sidebar");
  const [visibleSections, setVisibleSections] =
    useState<Record<SectionKey, boolean>>(DEFAULT_SECTIONS);

  const data = useActualiteitenData(kvkNummer);
  const subjectCounts = useSubjectCounts();

  const toggleSection = (key: SectionKey) => {
    setVisibleSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const sections = (
    <>
      {visibleSections.berichten && (
        <CollapsibleSection title="Berichten over uw buurt" defaultOpen>
          <BerichtenOverzicht
            berichten={data.berichten}
            status={data.berichtenStatus}
            hasPostcodes={data.hasPostcodes}
            postcodes={data.postcodes}
            hasSubjectFilter={data.hasSubjectFilter}
          />
        </CollapsibleSection>
      )}

      {visibleSections.informatie && (
        <CollapsibleSection title="Informatie" defaultOpen>
          <ArtikelenOverzicht
            articles={data.informatieArticles}
            status={data.articlesStatus}
          />
        </CollapsibleSection>
      )}

      {visibleSections.regelgeving && (
        <CollapsibleSection title="Wetten en regelgeving" defaultOpen>
          <ArtikelenOverzicht
            articles={data.regelgevingArticles}
            status={data.articlesStatus}
          />
        </CollapsibleSection>
      )}

      {visibleSections.subsidies && (
        <CollapsibleSection title="Subsidies en financiering" defaultOpen>
          <SubsidiesOverzicht
            subsidies={data.subsidies}
            status={data.subsidiesStatus}
          />
        </CollapsibleSection>
      )}
    </>
  );

  return (
    <>
      {/* View toggle */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-neutral-500">Weergave:</span>
        <div className="inline-flex overflow-hidden rounded border border-neutral-300">
          <button
            onClick={() => setViewMode("sidebar")}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              viewMode === "sidebar"
                ? "bg-[#154273] text-white"
                : "bg-white text-neutral-600 hover:bg-neutral-50"
            }`}
            title="Filters in zijbalk"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h4v16H3V4zm7 0h11v4H10V4zm0 8h11v4H10v-4z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode("top")}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              viewMode === "top"
                ? "bg-[#154273] text-white"
                : "bg-white text-neutral-600 hover:bg-neutral-50"
            }`}
            title="Filters bovenaan"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18v4H3V4zm0 8h18v4H3v-4zm0 8h18v4H3v-4z" />
            </svg>
          </button>
        </div>
      </div>

      {viewMode === "sidebar" ? (
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Sidebar filters */}
          <aside className="w-full shrink-0 lg:w-64">
            <Card className="sticky top-4">
              <VoorkeurenSidebar
                kvkNummer={kvkNummer}
                visibleSections={visibleSections}
                onToggleSection={toggleSection}
                sectionCounts={data.sectionCounts}
                subjectCounts={subjectCounts}
              />
            </Card>
          </aside>

          {/* Main content */}
          <div className="min-w-0 flex-1 space-y-6">
            <ActiveFilters kvkNummer={kvkNummer} />
            {sections}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <Card className="space-y-4">
            <h2 className="text-2xl font-bold">Uw onderwerpen</h2>
            <p className="text-sm text-neutral-600">
              Selecteer onderwerpen om relevante artikelen en informatie te zien.
            </p>
            <VoorkeurenTopbar kvkNummer={kvkNummer} />

            {/* Section toggles inline */}
            <div className="flex flex-wrap gap-3 border-t border-neutral-200 pt-3">
              <span className="text-sm font-semibold text-neutral-500">Secties:</span>
              {(Object.keys(SECTION_LABELS) as SectionKey[]).map((key) => {
                const count = data.sectionCounts[key];
                return (
                  <label
                    key={key}
                    className="flex cursor-pointer items-center gap-1.5 text-sm text-neutral-700"
                  >
                    <input
                      type="checkbox"
                      checked={visibleSections[key]}
                      onChange={() => toggleSection(key)}
                      className="h-4 w-4 shrink-0 rounded border-neutral-300 text-[#007bc7] accent-[#007bc7]"
                    />
                    <span className={visibleSections[key] ? "font-medium text-[#154273]" : ""}>
                      {SECTION_LABELS[key]}
                    </span>
                    {count !== null && (
                      <span className="text-xs text-neutral-600">({count})</span>
                    )}
                  </label>
                );
              })}
            </div>
          </Card>

          {sections}
        </div>
      )}
    </>
  );
};

function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Card>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between"
      >
        <h2 className="text-2xl font-bold">{title}</h2>
        <svg
          className={`h-5 w-5 shrink-0 text-neutral-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="mt-4">{children}</div>}
    </Card>
  );
}

export default ActualiteitenContent;
