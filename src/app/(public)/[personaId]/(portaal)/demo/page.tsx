"use client";

// Overview of the project's own components (src/components, not RHC), with
// their options and a live example. Prototype page: delete the folder
// (demo) when it is no longer needed; nothing else links to it.
import { useRef, useState, type ReactNode } from "react";
import {
  Alert,
  Button,
  Heading,
  Paragraph,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "@/components/rhc";
import BarGraph from "@/components/BarGraph";
import { Dropdown, DropdownItem } from "@/components/Dropdown";
import CountdownBar from "@/components/CountdownBar";
import ProgressBar from "@/components/ProgressBar";
import RangeSlider from "@/components/RangeSlider";
import ShareButton from "@/components/ShareButton";
import StepIndicator from "@/components/StepIndicator";
import StickyInfoBox from "@/components/StickyInfoBox";
import Switch from "@/components/Switch";
import TextBadge from "@/components/TextBadge";
import { ArchiveIcon } from "@/components/icons/archiveIcon";
import { FolderIcon } from "@/components/icons/folderIcon";

/** One option: name, type, default and what it does. */
type Option = [
  name: string,
  type: string,
  standard: string,
  description: string,
];

type Entry = {
  name: string;
  file: string;
  description: string;
  options: Option[];
  example?: ReactNode;
};

const Options = ({ options }: { options: Option[] }) => (
  <div className="mox-table-container">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHeaderCell>Optie</TableHeaderCell>
          <TableHeaderCell>Type</TableHeaderCell>
          <TableHeaderCell>Standaard</TableHeaderCell>
          <TableHeaderCell>Wat het doet</TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {options.map(([name, type, standard, description]) => (
          <TableRow key={name}>
            <TableCell>
              <code>{name}</code>
            </TableCell>
            <TableCell>
              <code>{type}</code>
            </TableCell>
            <TableCell>{standard}</TableCell>
            <TableCell>{description}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

const ComponentsDemoPage = () => {
  const [organisation, setOrganisation] = useState("Bloemenkwekerij");
  const [slider, setSlider] = useState(32);
  const countdownRef = useRef<{ reset: () => void }>(null);
  const [countdownDone, setCountdownDone] = useState(0);

  const entries: Entry[] = [
    {
      name: "Alert",
      file: "src/components/Alert.tsx",
      description:
        "RHC Alert met een sluitknop en vanzelf verdwijnen als extra opties. Importeer via @/components/rhc.",
      options: [
        [
          "type",
          '"info" | "ok" | "warning" | "error"',
          "info",
          "Soort melding, met het bijbehorende icoon.",
        ],
        [
          "closable",
          "boolean",
          "false",
          "Sluitknop rechtsboven. Niet bij een fout.",
        ],
        [
          "closeLabel",
          "string",
          "Melding sluiten",
          "Naam van de sluitknop voor schermlezers.",
        ],
        [
          "onClose",
          "() => void",
          "–",
          "Na het sluiten, bijvoorbeeld om de melding leeg te maken.",
        ],
        [
          "autoHide",
          "boolean | number",
          "false",
          "Vanzelf weg: true = leestijd van de tekst (3 tot 15 s), een getal = zoveel ms. Niet bij een fout.",
        ],
      ],
      example: (
        <div className="rhc-mox-row-gap">
          <Alert type="info" closable>
            <Paragraph>Info-melding met sluitknop.</Paragraph>
          </Alert>
          <Alert type="ok" closable autoHide={10000}>
            <Paragraph>Deze melding verdwijnt na 10 seconden.</Paragraph>
          </Alert>
        </div>
      ),
    },
    {
      name: "BarGraph",
      file: "src/components/BarGraph.tsx",
      description:
        "Liggende staafgrafiek. Label en waarde staan als tekst bij elke staaf.",
      options: [
        ["title", "string", "–", "Bijschrift van de grafiek."],
        [
          "items",
          "{ label, value, variant? }[]",
          "–",
          "De staven; variant per staaf mag.",
        ],
        ["max", "number", "grootste waarde", "Waarde van een volle staaf."],
        [
          "formatValue",
          "(value) => string",
          "String",
          "Hoe een waarde wordt getoond, zoals 32%.",
        ],
        [
          "variant",
          '"neutral" | "positive" | "negative"',
          "neutral",
          "Blauw (effen), groen (strepen) of rood (ruitjes).",
        ],
        [
          "track",
          "boolean",
          "false",
          "Grijze baan zo breed als de langste staaf.",
        ],
      ],
      example: (
        <BarGraph
          track
          title="Voorbeeld"
          items={[
            { label: "Neutraal", value: 60 },
            { label: "Positief", value: 90, variant: "positive" },
            { label: "Negatief", value: 25, variant: "negative" },
          ]}
        />
      ),
    },
    {
      name: "Dropdown en DropdownItem",
      file: "src/components/Dropdown.tsx",
      description:
        "Knop met een menu dat eronder opent (popover). Klik buiten het menu of Escape sluit het. Zoals de organisatiekeuze in de header en de acties in de Berichtenbox.",
      options: [
        ["trigger", "ReactNode", "–", "Inhoud van de knop."],
        [
          "triggerClassName",
          "string",
          "subtiele RHC-knop",
          "Uiterlijk van de knop.",
        ],
        [
          "triggerLabel",
          "string",
          "–",
          "Toegankelijke naam als de inhoud niet genoeg zegt.",
        ],
        [
          "triggerRef",
          "Ref<HTMLButtonElement>",
          "–",
          "Om de focus later terug te zetten.",
        ],
        [
          "align",
          '"start" | "end"',
          "end",
          "Menu links of rechts tegen de knop.",
        ],
        ["DropdownItem icon", "ReactNode", "–", "Icoon voor de tekst."],
        [
          "DropdownItem selected",
          "boolean",
          "–",
          "Keuze uit meerdere: vinkje en aria-current bij de gekozen optie.",
        ],
        [
          "DropdownItem keepOpen",
          "boolean",
          "false",
          "Menu blijft open na de klik.",
        ],
        ["DropdownItem onSelect", "() => void", "–", "Wat de keuze doet."],
      ],
      example: (
        <div className="rhc-mox-row-gap">
          <Dropdown align="start" trigger={<>Organisatie: {organisation}</>}>
            {["Bloemenkwekerij", "Tuincentrum", "Groothandel"].map((name) => (
              <DropdownItem
                key={name}
                selected={name === organisation}
                onSelect={() => setOrganisation(name)}
              >
                {name}
              </DropdownItem>
            ))}
          </Dropdown>
          <Dropdown align="start" trigger="Acties">
            <DropdownItem icon={<FolderIcon />}>
              Naar map verplaatsen
            </DropdownItem>
            <DropdownItem icon={<ArchiveIcon />}>Archiveren</DropdownItem>
          </Dropdown>
        </div>
      ),
    },
    {
      name: "CountdownBar",
      file: "src/components/CountdownBar.tsx",
      description:
        "Aftelbalk: een ProgressBar die van vol naar leeg loopt, standaard in 60 seconden. Na afloop roept hij onComplete aan; via een ref begint de ouder opnieuw. Gebruikt op de pagina Contactmomenten.",
      options: [
        ["onComplete", "() => void", "–", "Als de tijd om is."],
        ["seconds", "number", "60", "Duur van één ronde."],
        [
          "label",
          "string",
          "Tijd tot de volgende update",
          "Toegankelijke naam van de balk.",
        ],
        ["ref.reset()", "() => void", "–", "Begint opnieuw met de volle tijd."],
      ],
      example: (
        <div className="rhc-mox-row-gap">
          <CountdownBar
            ref={countdownRef}
            onComplete={() => setCountdownDone((n) => n + 1)}
          />
          <Paragraph>
            <div>Klaar: {countdownDone} keer. </div>
            <Button
              appearance="secondary-action-button"
              onClick={() => countdownRef.current?.reset()}
            >
              Opnieuw beginnen
            </Button>
          </Paragraph>
        </div>
      ),
    },
    {
      name: "ProgressBar",
      file: "src/components/ProgressBar.tsx",
      description:
        "Voortgangsbalk. Zonder value is de duur onbekend en loopt er een stuk balk heen en weer.",
      options: [
        [
          "label",
          "string",
          "–",
          "Toegankelijke naam, zoals Berichten ophalen.",
        ],
        ["value", "number", "–", "Huidige waarde; leeg = duur onbekend."],
        ["max", "number", "100", "Waarde van een volle balk."],
        [
          "valueText",
          "string",
          "–",
          "Wat een schermlezer voorleest, zoals 3 van 14 organisaties.",
        ],
      ],
      example: (
        <div className="rhc-mox-row-gap">
          <ProgressBar label="Voorbeeld" value={40} valueText="40%" />
          <ProgressBar label="Laden" />
        </div>
      ),
    },
    {
      name: "RangeSlider",
      file: "src/components/RangeSlider.tsx",
      description:
        "Schuifregelaar met label, de gekozen waarde en de grenzen eronder.",
      options: [
        ["label", "string", "–", "Zichtbare naam."],
        ["min / max", "number", "–", "Grenzen."],
        [
          "value / onChange",
          "number / (value) => void",
          "–",
          "Door de ouder bijgehouden waarde.",
        ],
        [
          "defaultValue",
          "number",
          "min",
          "Beginwaarde als de ouder niets bijhoudt.",
        ],
        [
          "formatValue",
          "(value) => string",
          "String",
          "Hoe de waarde wordt getoond, zoals 32 uur.",
        ],
        ["filled", "boolean", "false", "Baan gekleurd tot aan de knop."],
      ],
      example: (
        <RangeSlider
          label="Uren per week"
          min={0}
          max={40}
          value={slider}
          onChange={setSlider}
          formatValue={(value) => `${value} uur`}
          filled
        />
      ),
    },
    {
      name: "ShareButton",
      file: "src/components/ShareButton.tsx",
      description:
        "Opent het deelvenster van het systeem; zonder Web Share kopieert hij de link.",
      options: [
        ["title", "string", "paginatitel", "Titel om te delen."],
        ["text", "string", "–", "Korte tekst om te delen."],
        ["url", "string", "huidige pagina", "Pad of volledige link."],
        [
          "variant",
          '"link" | "menu"',
          "link",
          "Linkknop, of een item in een Dropdown.",
        ],
        ["onShared", "() => void", "–", "Na het sluiten van het deelvenster."],
      ],
      example: <ShareButton title="Componenten" />,
    },
    {
      name: "StepIndicator",
      file: "src/components/StepIndicator.tsx",
      description:
        "Stap X van Y met de stappen op een rij. Op een smal scherm alleen de tekst en de huidige stap.",
      options: [
        ["steps", "string[]", "–", "Namen van de stappen."],
        ["current", "number", "–", "Huidige stap, vanaf 0."],
        ["label", "string", "Voortgang", "Naam van de navigatie."],
      ],
      example: (
        <StepIndicator
          steps={["Gegevens", "Bijlagen", "Controleren", "Versturen"]}
          current={1}
        />
      ),
    },
    {
      name: "StickyInfoBox",
      file: "src/components/StickyInfoBox.tsx",
      description:
        "Kader met aanvullende informatie dat bij het scrollen in beeld blijft. Op een smal scherm scrolt het mee.",
      options: [
        ["title", "string", "–", "Kop van het kader."],
        ["headingLevel", "2 | 3 | 4", "2", "Niveau van de kop."],
        ["children", "ReactNode", "–", "Inhoud."],
      ],
      example: (
        <StickyInfoBox title="Wat heeft u nodig?" headingLevel={3}>
          <Paragraph>Uw KVK-nummer.</Paragraph>
        </StickyInfoBox>
      ),
    },
    {
      name: "Switch",
      file: "src/components/Switch.tsx",
      description:
        "Schakelaar (role=switch) voor een instelling die direct werkt. Label erboven, aan/uit met tekst.",
      options: [
        ["label", "string", "–", "Zichtbaar label; klikken schakelt ook."],
        [
          "checked / onChange",
          "boolean / (checked) => void",
          "–",
          "Door de ouder bijgehouden stand.",
        ],
        ["defaultChecked", "boolean", "false", "Beginstand."],
        ["disabled", "boolean", "false", "Niet te bedienen."],
        ["onText / offText", "string", "Aan / Uit", "Tekst bij de stand."],
        [
          "twoWay",
          "boolean",
          "false",
          "Keuze tussen twee opties: offText links, onText rechts.",
        ],
      ],
      example: (
        <div className="rhc-mox-row-gap">
          <Switch label="E-mailmeldingen" defaultChecked />
          <Switch label="LLM" twoWay offText="VLAM" onText="Claude" />
        </div>
      ),
    },
    {
      name: "TextBadge",
      file: "src/components/TextBadge.tsx",
      description:
        "Kort label met tekst; per soort het icoon van de RHC Alert.",
      options: [
        [
          "variant",
          '"neutral" | "info" | "ok" | "warning" | "error"',
          "neutral",
          "Soort, met icoon en kleur.",
        ],
        ["children", "ReactNode", "–", "De tekst."],
      ],
      example: (
        <Paragraph>
          <TextBadge>Concept</TextBadge>{" "}
          <TextBadge variant="info">Nieuw</TextBadge>{" "}
          <TextBadge variant="ok">Goedgekeurd</TextBadge>{" "}
          <TextBadge variant="warning">Actie nodig</TextBadge>{" "}
          <TextBadge variant="error">Afgewezen</TextBadge>
        </Paragraph>
      ),
    },
  ];

  const others: [string, string][] = [
    [
      "ComingSoon",
      "Pagina-inhoud voor een onderdeel dat nog niet werkt (title, summary, expectations, questions).",
    ],
    [
      "SideOverlay",
      "Paneel dat van rechts inschuift, met sneltoets (id, title, shortcut). Alleen voor demo doeleinden gebruikt door het Flags- en Persona-paneel.",
    ],
    [
      "LanguageSelect",
      "Taalmenu (languages, selectedLanguage, label, withIcon).",
    ],
    [
      "PageNumberNavigation",
      "Paginering met next/link (page, totalPages, maxVisiblePages, queryParam, query).",
    ],
    [
      "LogoutButton",
      "Uitloggen, ook zonder werkende Keycloak (className, children).",
    ],
    ["ErrorBoundary", "Foutmelding met Opnieuw proberen (error, reset)."],
    [
      "ContactMoment",
      "Eén contactmoment in de oude private route (notification).",
    ],
    [
      "form/FormField, FieldInfo",
      "TanStack Form-veld gekoppeld aan het RHC-tekstveld (field, label, readOnly).",
    ],
    [
      "icons/*",
      "Eigen iconen die RHC niet heeft, zoals ArchiveIcon, FolderIcon, CheckIcon en DigitalAssistantIcon.",
    ],
  ];

  return (
    <>
      <Heading level={1}>Eigen componenten</Heading>
      <Alert type="info">
        <Paragraph>
          Overzicht van de componenten in src/components die niet uit RHC komen,
          met hun opties en een voorbeeld.
        </Paragraph>
        <Paragraph>
          Overige componenten gebruiken{" "}
          <a
            href="https://rijkshuisstijl-community.vercel.app/?path=/docs/react-components-readme--docs"
            rel="extrenal"
          >
            RHC React-componenten
          </a>{" "}
          met aanpassingen middels CSS.
        </Paragraph>
      </Alert>

      <div className="rhc-mox-main-container">
        {entries.map(({ name, file, description, options, example }) => (
          <section key={name} className="rhc-mox-card" aria-label={name}>
            <Heading level={2}>{name}</Heading>
            <Paragraph>
              {description} <code>{file}</code>
            </Paragraph>
            <Options options={options} />
            {example && (
              <>
                <Heading level={3}>Voorbeeld</Heading>
                {example}
              </>
            )}
          </section>
        ))}

        <section className="rhc-mox-card" aria-labelledby="overige">
          <Heading level={2} id="overige">
            Overige componenten
          </Heading>
          <Paragraph>
            Voor één plek of voor het prototype; zonder voorbeeld.
          </Paragraph>
          <div className="mox-table-container">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>Component</TableHeaderCell>
                  <TableHeaderCell>Wat het doet (opties)</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {others.map(([name, description]) => (
                  <TableRow key={name}>
                    <TableCell>
                      <code>{name}</code>
                    </TableCell>
                    <TableCell>{description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      </div>
    </>
  );
};

export default ComponentsDemoPage;
