"use client";

import { type ReactNode, useState } from "react";
import {
  ActionGroup,
  Button,
  Fieldset,
  FormFieldCheckboxOption,
  Heading,
  Paragraph,
} from "@/components/rhc";
import {
  Accordion,
  AccordionSection,
} from "@rijkshuisstijl-community/components-react";
import VoorkeurenSidebar from "./_voorkeurenBeheer";
import { type SectionKey, SECTION_LABELS } from "./_subjectGroups";
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

const ActualiteitenContent = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("sidebar");
  const [visibleSections, setVisibleSections] =
    useState<Record<SectionKey, boolean>>(DEFAULT_SECTIONS);

  const data = useActualiteitenData();
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
      <ActionGroup role="group" aria-label="Weergave" direction="row">
        <Button
          appearance={
            viewMode === "sidebar"
              ? "primary-action-button"
              : "secondary-action-button"
          }
          aria-pressed={viewMode === "sidebar"}
          onClick={() => setViewMode("sidebar")}
        >
          Filters in zijbalk
        </Button>
        <Button
          appearance={
            viewMode === "top"
              ? "primary-action-button"
              : "secondary-action-button"
          }
          aria-pressed={viewMode === "top"}
          onClick={() => setViewMode("top")}
        >
          Filters bovenaan
        </Button>
      </ActionGroup>

      {viewMode === "sidebar" ? (
        <div className="rhc-grid">
          <aside className="mox-card rhc-grid__cell rhc-grid__cell-d-4">
            <VoorkeurenSidebar
              visibleSections={visibleSections}
              onToggleSection={toggleSection}
              sectionCounts={data.sectionCounts}
              subjectCounts={subjectCounts}
            />
          </aside>

          <div className="rhc-grid__cell rhc-grid__cell-d-8 mox-row-gap">
            <ActiveFilters />
            {sections}
          </div>
        </div>
      ) : (
        <>
          <div className="mox-card">
            <Heading level={2}>Uw onderwerpen</Heading>
            <Paragraph>
              Selecteer onderwerpen om relevante artikelen en informatie te
              zien.
            </Paragraph>
            <VoorkeurenTopbar />

            <Fieldset legend="Secties">
              {(Object.keys(SECTION_LABELS) as SectionKey[]).map((key) => {
                const count = data.sectionCounts[key];
                return (
                  <FormFieldCheckboxOption
                    key={key}
                    label={
                      count !== null
                        ? `${SECTION_LABELS[key]} (${count})`
                        : SECTION_LABELS[key]
                    }
                    checked={visibleSections[key]}
                    onChange={() => toggleSection(key)}
                  />
                );
              })}
            </Fieldset>
          </div>

          {sections}
        </>
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
    <div className="mox-faq-card">
      <Accordion>
        <AccordionSection
          headingLevel={2}
          label={title}
          body={null}
          expanded={open}
          onActivate={() => setOpen(!open)}
        >
          {children}
        </AccordionSection>
      </Accordion>
    </div>
  );
}

export default ActualiteitenContent;
