"use client";

// Overview of the project's own components (src/components, not RHC), with
// their options and a live example. Prototype page: delete the folder
// (demo) when it is no longer needed; nothing else links to it.
import {
  useEffect,
  useOptimistic,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { setFeatureFlag } from "@/app/actions";
import { useFlag } from "@/app/(public)/_flags/flagsContext";
import {
  AccordionProvider,
  ActionGroup,
  Alert,
  BreadcrumbNav,
  BreadcrumbNavLink,
  BreadcrumbNavSeparator,
  Button,
  DataSummary,
  DataSummaryItem,
  Fieldset,
  Footer,
  FormFieldCheckboxOption,
  FormFieldRadio,
  FormFieldTextInput,
  Heading,
  Icon,
  Link,
  LinkButton,
  LinkList,
  LinkListLink,
  Logo,
  NavBar,
  NavigationList,
  NavigationListItem,
  NumberBadge,
  OrderedList,
  OrderedListItem,
  Paragraph,
  Separator,
  SideNav,
  SideNavItem,
  SideNavLink,
  SideNavList,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  UnorderedList,
  UnorderedListItem,
  VisuallyHidden,
} from "@/components/rhc";
import {
  FormFieldSelect,
  FormFieldTextarea,
  IconButton,
  SelectOption,
} from "@rijkshuisstijl-community/components-react";
import BarGraph from "@/components/BarGraph";
import { Dropdown, DropdownItem } from "@/components/Dropdown";
import CountdownBar from "@/components/CountdownBar";
import PageNumberNavigation from "@/components/pageNumberNavigation";
import ProgressBar from "@/components/ProgressBar";
import RangeSlider from "@/components/RangeSlider";
import ShareButton from "@/components/ShareButton";
import StepIndicator from "@/components/StepIndicator";
import StatusTrack, { type StatusStep } from "@/components/StatusTrack";
import StickyInfoBox from "@/components/StickyInfoBox";
import { BewaarKnop, NietRelevantKnop } from "@/components/save/saveActions";
import type { BewaarItem } from "@/components/save/useSaved";
import NextLink from "next/link";
import Image from "next/image";
import Switch from "@/components/Switch";
import TextBadge from "@/components/TextBadge";
import { ArchiveIcon } from "@/components/icons/archiveIcon";
import { FolderIcon } from "@/components/icons/folderIcon";
import type { DemoBericht } from "@/demo";
import BerichtRij from "../berichtenbox/_berichtRij";
import MapDialog from "../berichtenbox/_mapDialog";
import OphaalVoortgang from "../berichtenbox/_ophaalVoortgang";
import PdfVoorbeeld from "../berichtenbox/_pdfVoorbeeld";
import {
  Assistent,
  Bronnen,
  Deelverzoek,
  Denkt,
  Gebruiker,
  Suggesties,
} from "../digitale-assistent/_onderdelen";

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
  /**
   * Text, or JSX to mark words up, such as <code>. An array gives one
   * paragraph per item.
   */
  description: ReactNode | ReactNode[];
  options: Option[];
  example?: ReactNode;
};

const Options = ({ options }: { options: Option[] }) => (
  <div className="rhc-mox-table-container">
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

const SIMPLE_ROWS: [string, string, string][] = [
  ["Lorem ipsum", "Dolor sit amet", "Consectetur"],
  ["Adipiscing elit", "Sed do eiusmod", "Tempor incididunt"],
  ["Ut labore", "Et dolore magna", "Aliqua"],
  ["Ut enim ad minim", "Veniam quis", "Nostrud exercitation"],
  ["Ullamco laboris", "Nisi ut aliquip", "Ex ea commodo"],
];

type DemoMessage = {
  id: string;
  sender: string;
  subject: string;
  date: string;
  unread: boolean;
  attachment: boolean;
};

const DEMO_MESSAGES: DemoMessage[] = [
  {
    id: "1",
    sender: "Belastingdienst",
    subject: "Aangifte omzetbelasting",
    date: "2026-04-22",
    unread: true,
    attachment: true,
  },
  {
    id: "2",
    sender: "KVK",
    subject: "Uittreksel Handelsregister",
    date: "2026-03-14",
    unread: false,
    attachment: false,
  },
  {
    id: "3",
    sender: "Gemeente Utrecht",
    subject: "Aanslag reclamebelasting",
    date: "2026-04-02",
    unread: true,
    attachment: false,
  },
  {
    id: "4",
    sender: "RVO",
    subject: "Besluit subsidieaanvraag",
    date: "2026-02-27",
    unread: false,
    attachment: true,
  },
];

type SortKey = "sender" | "subject" | "date";
type Sort = { key: SortKey; ascending: boolean };

/**
 * Column header that sorts, as in the Berichtenbox: a button in the <th>,
 * with aria-sort on the cell (RHC TableHeaderCell does not pass it on).
 */
const SortHeader = ({
  sortKey,
  sort,
  onSort,
  children,
}: {
  sortKey: SortKey;
  sort: Sort;
  onSort: (key: SortKey) => void;
  children: string;
}) => {
  const direction =
    sort.key === sortKey
      ? sort.ascending
        ? "ascending"
        : "descending"
      : "none";
  return (
    <th
      scope="col"
      aria-sort={direction}
      className="utrecht-table__header-cell"
    >
      <Button
        appearance="subtle-button"
        className="utrecht-table__header-cell-button"
        onClick={() => onSort(sortKey)}
      >
        {children}
        <Icon
          icon={direction === "none" ? "arrows-sort" : `sort-${direction}`}
        />
      </Button>
    </th>
  );
};

/** Table as in the Berichtenbox: sorting, linked rows, unread and actions. */
const DemoTable = () => {
  const [sort, setSort] = useState<Sort>({ key: "date", ascending: false });
  const onSort = (key: SortKey) =>
    setSort((current) => ({
      key,
      ascending: current.key === key ? !current.ascending : true,
    }));
  const rows = [...DEMO_MESSAGES].sort((a, b) => {
    const order = a[sort.key].localeCompare(b[sort.key], "nl");
    return sort.ascending ? order : -order;
  });

  return (
    <div className="rhc-mox-table-container">
      <Table>
        <TableHeader>
          <TableRow>
            <SortHeader sortKey="sender" sort={sort} onSort={onSort}>
              Afzender
            </SortHeader>
            <SortHeader sortKey="subject" sort={sort} onSort={onSort}>
              Onderwerp
            </SortHeader>
            <SortHeader sortKey="date" sort={sort} onSort={onSort}>
              Datum
            </SortHeader>
            <TableHeaderCell scope="col">
              <VisuallyHidden>Bijlage</VisuallyHidden>
            </TableHeaderCell>
            <TableHeaderCell scope="col">
              <VisuallyHidden>Acties</VisuallyHidden>
            </TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((message) => (
            <TableRow key={message.id} className="rhc-mox-row-linked">
              <TableCell>
                {message.unread && <VisuallyHidden>Ongelezen: </VisuallyHidden>}
                {message.sender}
              </TableCell>
              <TableCell>
                <Link
                  href="#"
                  className={`rhc-mox-row-linked__link${message.unread ? " rhc-mox-unread" : ""}`}
                >
                  {message.subject}
                </Link>
              </TableCell>
              <TableCell>
                {new Date(message.date).toLocaleDateString("nl-NL", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </TableCell>
              <TableCell>
                {message.attachment && (
                  <>
                    {/* Same size as in the Berichtenbox: an icon in a
                        table cell has no size of its own. */}
                    <Icon
                      icon="paperclip"
                      className="rhc-mox-attachment-icon"
                    />
                    <VisuallyHidden>Heeft bijlage</VisuallyHidden>
                  </>
                )}
              </TableCell>
              <TableCell>
                <Dropdown
                  trigger={
                    <>
                      <Icon icon="meer" />
                      <VisuallyHidden>
                        Acties voor {message.subject}
                      </VisuallyHidden>
                    </>
                  }
                >
                  <DropdownItem icon={<ArchiveIcon />}>Archiveren</DropdownItem>
                  <DropdownItem icon={<Icon icon="verwijderen" />}>
                    Verwijderen
                  </DropdownItem>
                </Dropdown>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

/** Item for the save buttons on this page; shows up under Bewaarde items. */
const DEMO_SAVE_ITEM: BewaarItem = {
  sleutel: "demo:voorbeeld",
  categorie: "Demo",
  titel: "Voorbeeld op de pagina Componenten",
  samenvatting: "Bewaard vanaf de demopagina.",
  href: "/demo",
};

const DEMO_STEPS: StatusStep[] = [
  { titel: "Aanvraag ontvangen", soort: "voltooid", datum: "3 maart 2026" },
  {
    titel: "Beoordeling",
    soort: "huidig",
    datum: "Sinds 10 maart 2026",
    open: true,
    tekst: ["De organisatie bekijkt uw aanvraag."],
  },
  { titel: "Besluit", soort: "volgende", datum: "Verwacht voor 1 mei 2026" },
  { titel: "Uitbetaling", soort: "later" },
];

/** Native <dialog> with the look of rhc-mox-dialog, opened with showModal. */
const DemoDialog = () => {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <>
      <ActionGroup>
        <Button
          appearance="secondary-action-button"
          onClick={() => ref.current?.showModal()}
        >
          Dialoog openen
        </Button>
      </ActionGroup>
      <dialog
        ref={ref}
        className="rhc-mox-dialog"
        aria-labelledby="demo-dialog-kop"
      >
        <Heading level={2} id="demo-dialog-kop">
          Weet u het zeker?
        </Heading>
        <Paragraph>
          Een dialoog vraagt om een keuze voordat u verder gaat.
        </Paragraph>
        <ActionGroup>
          <Button
            appearance="primary-action-button"
            onClick={() => ref.current?.close()}
          >
            Ja, doorgaan
          </Button>
          <Button
            appearance="secondary-action-button"
            onClick={() => ref.current?.close()}
          >
            Annuleren
          </Button>
        </ActionGroup>
      </dialog>
    </>
  );
};

/**
 * Switch between the current and the new MijnOverheid house style, as in the
 * Flags panel: saves the flag in the cookie and reloads the server parts.
 */
const BrandSwitch = () => {
  const router = useRouter();
  const newBrand = useFlag("mox_nieuweHuisstijl");
  const [shown, setShown] = useOptimistic(newBrand);
  const [, startTransition] = useTransition();
  return (
    <Switch
      label="Huisstijl"
      twoWay
      offText="Huidig"
      onText="Nieuw"
      checked={shown}
      onChange={(next) =>
        startTransition(async () => {
          setShown(next);
          await setFeatureFlag("mox_nieuweHuisstijl", next);
          router.refresh();
        })
      }
    />
  );
};

/** Card per component: description, options and an example. */
const card = ({ name, file, description, options, example }: Entry) => (
  <section key={name} className="rhc-mox-card" aria-label={name}>
    <Heading level={3}>{name}</Heading>
    <Paragraph>
      <code>{file}</code>
    </Paragraph>
    {(Array.isArray(description) ? description : [description]).map(
      (text, index) => (
        <Paragraph key={index}>{text}</Paragraph>
      ),
    )}
    <Options options={options} />
    {example && (
      <>
        <Heading level={4}>Voorbeeld</Heading>
        {example}
      </>
    )}
  </section>
);

const SimpleTable = ({ rows }: { rows: [string, string][] }) => (
  <div className="rhc-mox-table-container">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHeaderCell>Component</TableHeaderCell>
          <TableHeaderCell>Waar en hoe</TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map(([name, description]) => (
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
);

const DEMO_INBOX: DemoBericht[] = [
  {
    id: "demo-1",
    afzenderId: "belastingdienst",
    afzender: "Belastingdienst",
    onderwerp: "Uw voorlopige aanslag 2026",
    inhoud: [],
    datum: "2026-10-24",
    isOngelezen: true,
    heeftBijlage: true,
  },
  {
    id: "demo-2",
    afzenderId: "kvk",
    afzender: "KVK",
    onderwerp: "Uw inschrijving is gewijzigd",
    inhoud: [],
    datum: "2026-10-20",
    isOngelezen: false,
    heeftBijlage: false,
  },
  {
    id: "demo-3",
    afzenderId: "rvo",
    afzender: "RVO",
    onderwerp: "Uw aanvraag is ontvangen",
    inhoud: [],
    datum: "2026-10-26",
    isOngelezen: true,
    heeftBijlage: false,
  },
];

/** Message rows; the first row is flagged, the third has just come in. */
const DemoMessageRows = () => {
  const [flagged, setFlagged] = useState<string[]>(["demo-2"]);
  return (
    <div className="rhc-mox-table-container">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHeaderCell>
              <VisuallyHidden>Markering</VisuallyHidden>
            </TableHeaderCell>
            <TableHeaderCell>Afzender</TableHeaderCell>
            <TableHeaderCell>Onderwerp</TableHeaderCell>
            <TableHeaderCell>Datum</TableHeaderCell>
            <TableHeaderCell>
              <VisuallyHidden>Bijlage</VisuallyHidden>
            </TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {DEMO_INBOX.map((message) => (
            <BerichtRij
              key={message.id}
              bericht={message}
              ongelezen={message.isOngelezen}
              gemarkeerd={flagged.includes(message.id)}
              nieuw={message.id === "demo-3"}
              onMarkeer={() =>
                setFlagged((ids) =>
                  ids.includes(message.id)
                    ? ids.filter((id) => id !== message.id)
                    : [...ids, message.id],
                )
              }
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const DemoFolderDialog = () => {
  const [opener, setOpener] = useState<HTMLElement | null>(null);
  const [folder, setFolder] = useState<string | null>("Belastingen");
  return (
    <>
      <Paragraph>
        Dit bericht staat in: <b>{folder ?? "geen map"}</b>
      </Paragraph>
      <Button
        appearance="secondary-action-button"
        onClick={(event) => setOpener(event.currentTarget)}
      >
        <FolderIcon />
        Verplaats naar map
      </Button>
      {opener && (
        <MapDialog
          open
          mappen={["Belastingen", "Personeel", "Vergunningen"]}
          huidige={folder}
          opener={opener}
          onKies={(name) => {
            setFolder(name);
            return null;
          }}
          onSluit={() => setOpener(null)}
        />
      )}
    </>
  );
};

const berichtenboxEntries: Entry[] = [
  {
    name: "BerichtRij",
    file: "src/app/(public)/[personaId]/(portaal)/berichtenbox/_berichtRij.tsx",
    description:
      "Een bericht als tabelrij: markeren, afzender, onderwerp, datum en bijlage. De link van het onderwerp beslaat de hele rij (rhc-mox-row-linked). Ongelezen: vet met een stip (rhc-mox-unread, rhc-mox-status-unread).",
    options: [
      ["bericht", "DemoBericht", "", "Het bericht"],
      ["ongelezen", "boolean", "", "Vet, met een stip en de tekst Ongelezen"],
      [
        "gemarkeerd",
        "boolean",
        "",
        "Gevulde vlag; de knop krijgt aria-pressed",
      ],
      ["nieuw", "boolean", "false", "Net binnengekomen: licht kort op"],
      ["onMarkeer", "() => void", "", "Klik op de vlag (rhc-mox-button-mark)"],
      ["children", "ReactNode", "", "Extra cellen achteraan, zoals acties"],
    ],
    example: <DemoMessageRows />,
  },
  {
    name: "Filterbalk",
    file: "rhc-mox-inbox-filters in src/styles/rhc.css",
    description:
      "Zoekveld en keuzelijst naast elkaar boven de inbox. Daaronder het aantal berichten (rhc-mox-notice-amount-inbox).",
    options: [
      ["rhc-mox-inbox-filters", "class", "", "Zet de velden naast elkaar"],
      [
        "rhc-mox-notice-amount-inbox",
        "class",
        "",
        "Regel met het aantal berichten en organisaties",
      ],
    ],
    example: (
      <>
        <div className="rhc-mox-inbox-filter rhc-mox-inbox-filters">
          <FormFieldTextInput label="Filter berichten" type="search" />
          <FormFieldSelect label="Afzender" defaultValue="">
            <SelectOption value="">Alle afzenders</SelectOption>
            <SelectOption value="belastingdienst">Belastingdienst</SelectOption>
            <SelectOption value="kvk">KVK</SelectOption>
          </FormFieldSelect>
        </div>
        <Paragraph className="rhc-mox-notice-amount-inbox">
          3 berichten van 3 organisaties, 2 ongelezen
        </Paragraph>
      </>
    ),
  },
  {
    name: "OphaalVoortgang",
    file: "src/app/(public)/[personaId]/(portaal)/berichtenbox/_ophaalVoortgang.tsx",
    description:
      "Melding met voortgang terwijl de inbox berichten ophaalt bij de organisaties. Met useNagebootstOphalen uit hetzelfde bestand.",
    options: [
      [
        "voortgang",
        "{ bronnen, klaar, gevonden } | null",
        "",
        "Aantal organisaties, hoeveel er klaar zijn en hoeveel berichten er gevonden zijn",
      ],
    ],
    example: (
      <OphaalVoortgang voortgang={{ bronnen: 12, klaar: 7, gevonden: 23 }} />
    ),
  },
  {
    name: "Wat kunt u doen?",
    file: "rhc-mox-message-actions in src/styles/rhc.css",
    description:
      "Blok onder een bericht met de acties die de ondernemer nu kan doen (variant C).",
    options: [
      [
        "rhc-mox-message-actions",
        "class",
        "",
        "Kader om kop, uitleg en knoppen",
      ],
    ],
    example: (
      <section
        aria-labelledby="demo-wat-kunt-u-doen"
        className="rhc-mox-message-actions"
      >
        <Heading level={5} id="demo-wat-kunt-u-doen">
          Wat kunt u doen?
        </Heading>
        <Paragraph>Betaal de aanslag voor 1 december.</Paragraph>
        <ActionGroup role="group">
          <Button appearance="primary-action-button">Nu betalen</Button>
          <Button appearance="secondary-action-button">
            Betalingsregeling aanvragen
          </Button>
        </ActionGroup>
      </section>
    ),
  },
  {
    name: "MapDialog",
    file: "src/app/(public)/[personaId]/(portaal)/berichtenbox/_mapDialog.tsx",
    description:
      "Modale dialog om een map te kiezen of een nieuwe map te maken. Na het sluiten gaat de focus terug naar de knop.",
    options: [
      ["open", "boolean", "", "Toon de dialog"],
      ["mappen", "string[]", "", "Bestaande mappen"],
      ["huidige", "string | null", "", "De map waarin het bericht nu staat"],
      ["opener", "HTMLElement | null", "", "Krijgt de focus na het sluiten"],
      [
        "onKies",
        "(map) => string | null | Promise",
        "",
        "Geeft null als het lukte, anders een foutmelding",
      ],
      ["onSluit", "() => void", "", "Na het sluiten"],
    ],
    example: <DemoFolderDialog />,
  },
  {
    name: "PdfVoorbeeld",
    file: "src/app/(public)/[personaId]/(portaal)/berichtenbox/_pdfVoorbeeld.tsx",
    description:
      "Het bericht als pdf in de pagina, met links om het te downloaden of als tekst te lezen (variant B).",
    options: [
      ["pdf", "string", "", "Adres van de pdf"],
      [
        "tekst",
        "string",
        "",
        "Adres van de tekstversie. Zonder: geen tekstlink.",
      ],
    ],
    example: (
      <PdfVoorbeeld
        pdf="/voorbeeld-bijlage.pdf"
        tekst="/voorbeeld-bijlage.txt"
      />
    ),
  },
];

const DEMO_SOURCES = [
  { label: "KVK Handelsregister", geraadpleegdOp: "26 oktober 2026" },
  {
    label: "RVO",
    titel: "Energiebesparingsplicht",
    url: "https://www.rvo.nl/onderwerpen/energiebesparingsplicht",
    geraadpleegdOp: "26 oktober 2026",
  },
];

const noop = () => {};

/** A message in the chat, aligned as in the conversation. */
const ChatRule = ({ children }: { children: ReactNode }) => (
  <div className="rhc-mox-chat-rule">{children}</div>
);

const assistantEntries: Entry[] = [
  {
    name: "Gebruiker en Assistent",
    file: "src/app/(public)/[personaId]/(portaal)/digitale-assistent/_onderdelen.tsx",
    description:
      "Vraag van de gebruiker (rechts, blauw) en antwoord van de assistent (links), met verborgen 'U:' en 'Assistent:' voor schermlezers. Het antwoord mag markdown bevatten.",
    options: [
      [
        "item",
        "Item",
        "",
        "Gebruiker: { tekst }. Assistent: { tekst, bronnen?, vervolg? }; vervolg is een knop naar een pagina.",
      ],
    ],
    example: (
      <div className="rhc-mox-chat">
        <ChatRule>
          <Gebruiker
            item={{
              id: "demo-vraag",
              soort: "gebruiker",
              tekst: "Geldt de energiebesparingsplicht voor mij?",
            }}
          />
        </ChatRule>
        <ChatRule>
          <Assistent
            item={{
              id: "demo-antwoord",
              soort: "assistent",
              tekst:
                "Dat hangt af van uw **energieverbruik**. De plicht geldt als u per jaar:\n\n- meer dan 50.000 kWh stroom gebruikt, of\n- meer dan 25.000 m3 gas.",
              bronnen: DEMO_SOURCES,
              vervolg: {
                label: "Bekijk uw gegevens",
                href: "/bedrijfsgegevens",
              },
            }}
          />
        </ChatRule>
      </div>
    ),
  },
  {
    name: "Bronnen",
    file: "src/app/(public)/[personaId]/(portaal)/digitale-assistent/_onderdelen.tsx",
    description:
      "Bronvermelding onder een antwoord, met de datum van raadplegen. Zonder url zoekt het de link bij het label op.",
    options: [
      [
        "bronnen",
        "Bron[]",
        "",
        "{ label, titel?, url?, geraadpleegdOp? }. Leeg: niets.",
      ],
    ],
    example: <Bronnen bronnen={DEMO_SOURCES} />,
  },
  {
    name: "Denkt",
    file: "src/app/(public)/[personaId]/(portaal)/digitale-assistent/_onderdelen.tsx",
    description:
      "Wachtteken terwijl de assistent een antwoord maakt (rhc-mox-chat-thinking, rhc-mox-wait).",
    options: [
      [
        "tekst",
        "string",
        "",
        "Wat de assistent nu doet. Leeg: alleen 'Even geduld' voor schermlezers.",
      ],
    ],
    example: (
      <ChatRule>
        <Denkt tekst="Ik zoek in de KOOP Regelingenbank" />
      </ChatRule>
    ),
  },
  {
    name: "Suggesties",
    file: "src/app/(public)/[personaId]/(portaal)/digitale-assistent/_onderdelen.tsx",
    description:
      "Voorbeeldvragen aan het begin van een gesprek. Een klik stelt de vraag.",
    options: [
      [
        "item",
        "Item",
        "",
        "{ opnieuw }: met opnieuw ook de knop 'Uitleg opnieuw tonen'",
      ],
      ["onVraag", "(vraag) => void", "", "Klik op een voorbeeldvraag"],
      ["onUitleg", "() => void", "", "Klik op 'Uitleg opnieuw tonen'"],
    ],
    example: (
      <ChatRule>
        <Suggesties
          item={{ id: "demo-suggesties", soort: "suggesties", opnieuw: true }}
          onVraag={noop}
          onUitleg={noop}
        />
      </ChatRule>
    ),
  },
  {
    name: "Deelverzoek",
    file: "src/app/(public)/[personaId]/(portaal)/digitale-assistent/_onderdelen.tsx",
    description:
      "Vraag om toestemming om gegevens uit een bron te gebruiken. Na delen of weigeren toont de kaart de uitkomst.",
    options: [
      [
        "item",
        "Item",
        "",
        '{ bron, omschrijving, vanBackend, staat: "open" | "gedeeld" | "geweigerd", energie? }',
      ],
      [
        "drempel",
        "{ kwh, gas } | null",
        "",
        "Grens voor het energieverbruik na delen",
      ],
      ["onDelen", "() => void", "", "Klik op Delen"],
      ["onNietDelen", "() => void", "", "Klik op Niet delen"],
    ],
    example: (
      <Deelverzoek
        item={{
          id: "demo-deelverzoek",
          soort: "deelverzoek",
          bron: "uw EU Business Wallet",
          omschrijving:
            "De assistent wil uw energieverbruik van 2025 gebruiken. Daarmee kan hij nagaan of de informatieplicht voor u geldt.",
          vanBackend: false,
          staat: "open",
        }}
        drempel={null}
        onDelen={noop}
        onNietDelen={noop}
      />
    ),
  },
  {
    name: "Gesprek",
    file: "rhc-mox-chat in src/styles/rhc.css; src/app/(public)/[personaId]/(portaal)/digitale-assistent/_chat.tsx",
    description:
      "Het geheel: berichten in een log (role=log, aria-live) dat scrolt, het invoerveld met knoppen en de uitleg over AI eronder.",
    options: [
      ["rhc-mox-chat", "class", "", "Kaart om het hele gesprek"],
      [
        "rhc-mox-chat-messages",
        "class",
        "",
        "Lijst met berichten; scrolt bij een lang gesprek",
      ],
      [
        "rhc-mox-chat-rule",
        "class",
        "",
        "Eén bericht; zet een vraag rechts en een antwoord links",
      ],
      ["rhc-mox-chat-input", "class", "", "Invoerveld met knoppen"],
      ["rhc-mox-chat-disclaimer", "class", "", "Uitleg over AI, met icoon"],
    ],
    example: (
      <div className="rhc-mox-chat">
        <div
          className="rhc-mox-chat-messages"
          role="log"
          aria-live="polite"
          aria-label="Voorbeeldgesprek"
        >
          <ChatRule>
            <Gebruiker
              item={{
                id: "demo-gesprek-vraag",
                soort: "gebruiker",
                tekst: "Hoe kan ik mijn bedrijfsgegevens bekijken?",
              }}
            />
          </ChatRule>
          <ChatRule>
            <Assistent
              item={{
                id: "demo-gesprek-antwoord",
                soort: "assistent",
                tekst:
                  "Uw bedrijfsgegevens staan in het Handelsregister van de KVK. U ziet ze ook in dit portaal onder **Bedrijfsgegevens**.",
              }}
            />
          </ChatRule>
          <ChatRule>
            <Denkt tekst="" />
          </ChatRule>
        </div>
        <form
          className="rhc-mox-chat-input"
          onSubmit={(event) => event.preventDefault()}
        >
          <label htmlFor="demo-chat-input">
            <VisuallyHidden>Uw vraag</VisuallyHidden>
          </label>
          <textarea
            className="utrecht-textarea utrecht-textarea--html-textarea rhc-textarea"
            id="demo-chat-input"
            placeholder="Waarmee kan ik u helpen?"
          />
          <ActionGroup>
            <Button type="submit" appearance="primary-action-button">
              Vraag stellen
            </Button>
            <Button appearance="secondary-action-button">
              Nieuw gesprek starten
            </Button>
          </ActionGroup>
        </form>
        <Paragraph className="rhc-mox-chat-disclaimer">
          <Icon icon="info-circle" />
          De antwoorden van deze assistent worden door AI gemaakt en kunnen
          fouten bevatten. Controleer belangrijke informatie altijd bij de
          oorspronkelijke bron.
        </Paragraph>
      </div>
    ),
  },
];

/**
 * Examples of the layout parts. Not the components from src/layouts
 * themselves: those log out, switch organisation and use fixed ids, and
 * would then exist twice on this page.
 */
const layoutEntries: Entry[] = [
  {
    name: "Header",
    file: "src/layouts/header/index.tsx",
    description: [
      "Kop van elke pagina met het logo, de naam van het portaal, de taalkeuze, de ingelogde persoon en Uitloggen. Gebouwd met RHC Logo en NavBar.",
      "Heeft iemand meer organisaties, dan opent de naam een Dropdown om te wisselen. Op een smal scherm staan taal, naam en Uitloggen in het menu.",
    ],
    options: [
      [
        "signedIn",
        "boolean",
        "true",
        "Ingelogd: naam en Uitloggen, anders de inlogknop",
      ],
      ["naam", "string", "Robin Vogel", "Naam van de ingelogde persoon"],
      [
        "organisaties",
        "{ id, handelsnaam }[]",
        "[]",
        "Meer dan één: een keuzemenu om te wisselen",
      ],
      [
        "actieveOrganisatieId / actieveOrganisatieNaam",
        "string",
        "–",
        "De gekozen organisatie, naast de naam",
      ],
      ["metMenu", "boolean", "false", "Toont de knop Menu op een smal scherm"],
    ],
    example: (
      <header className="utrecht-page-header">
        <div className="utrecht-page-header__content">
          <Logo organisation="MijnOverheid Zakelijk" subtitle="">
            <Image
              src="/beeldmerk-rijksoverheid.svg"
              alt=""
              width={50}
              height={100}
              unoptimized
            />
          </Logo>
          <NavBar
            headingItem={{
              href: "/",
              id: "demo-header-heading",
              label: "MijnOverheid Zakelijk",
            }}
            items={[]}
          >
            <ul className="rhc-nav-bar__list">
              <li className="rhc-nav-bar__item">
                <Dropdown
                  align="end"
                  triggerClassName="rhc-nav-bar__link rhc-mox-header-organizations__trigger"
                  triggerLabel="Bloemenkwekerij, organisatie kiezen"
                  trigger={
                    <>
                      <Icon icon="user" />
                      <span className="rhc-nav-bar__label rhc-mox-header-organizations__identity">
                        <span>Robin Vogel</span>
                        <span className="mox-header-organization">
                          Bloemenkwekerij
                        </span>
                      </span>
                      <Icon icon="chevron-down" />
                    </>
                  }
                >
                  <DropdownItem selected>Bloemenkwekerij</DropdownItem>
                  <DropdownItem selected={false}>Tuincentrum</DropdownItem>
                </Dropdown>
              </li>
              <li className="rhc-nav-bar__item">
                <NextLink
                  href="/demo"
                  className="rhc-nav-bar__link mox-logout-button"
                >
                  <Icon icon="uitloggen" />
                  <span className="rhc-nav-bar__label">Uitloggen</span>
                </NextLink>
              </li>
            </ul>
          </NavBar>
        </div>
      </header>
    ),
  },
  {
    name: "Navigatie",
    file: "src/layouts/navigation/index.tsx",
    description: [
      "Het menu aan de linkerkant, gebouwd met RHC SideNav. Groepen links staan in een eigen SideNavList, met een Separator ertussen. De link van de huidige pagina krijgt current, en daarmee aria-current.",
      "Op een smal scherm is het menu dicht en opent de knop Menu in de header het.",
    ],
    options: [
      [
        "flags",
        "FeatureFlags",
        "alles aan",
        "Pagina's die in het Flags-paneel uit staan, verdwijnen uit het menu",
      ],
      [
        "berichtenboxBadge / lopendeZakenBadge",
        "ReactNode",
        "–",
        "Teller achter de link, zoals het aantal ongelezen berichten",
      ],
      [
        "SideNavLink current",
        "boolean",
        "false",
        "De huidige pagina, of een pagina eronder",
      ],
      [
        "SideNavLink icon",
        "RHC-icoon",
        "–",
        "Icoon voor de tekst; een eigen icoon zet je als kind",
      ],
    ],
    example: (
      <SideNav aria-label="Voorbeeld van het menu">
        <SideNavList>
          <SideNavItem>
            <SideNavLink href="/" icon="home">
              Home
            </SideNavLink>
          </SideNavItem>
        </SideNavList>
        <Separator />
        <SideNavList>
          <SideNavItem>
            <SideNavLink href="/bedrijfsgegevens" icon="briefcase">
              Bedrijfsgegevens
            </SideNavLink>
          </SideNavItem>
          <SideNavItem>
            <SideNavLink href="/berichtenbox" icon="inbox" current>
              Berichtenbox
              <span className="mox-badge-holder">
                <NumberBadge>3</NumberBadge>
                <VisuallyHidden>ongelezen</VisuallyHidden>
              </span>
            </SideNavLink>
          </SideNavItem>
          <SideNavItem>
            <SideNavLink href="/lopendezaken" icon="activiteit">
              Lopende zaken
            </SideNavLink>
          </SideNavItem>
        </SideNavList>
        <Separator />
        <SideNavList>
          <SideNavItem>
            <SideNavLink href="/contactvoorkeuren" icon="instellingen">
              Contactvoorkeuren
            </SideNavLink>
          </SideNavItem>
        </SideNavList>
      </SideNav>
    ),
  },
  {
    name: "Breadcrumb",
    file: "src/layouts/breadcrumb/index.tsx",
    description: [
      "Kruimelpad boven de inhoud, gebouwd met RHC BreadcrumbNav. Het maakt de kruimels uit het pad van de pagina; de namen staan in breadcrumbLabels. Niet op de homepage.",
      <>
        Een pagina met een eigen naam, zoals een bericht, zet die met{" "}
        <code>HuidigeKruimel</code> uit{" "}
        <code>src/layouts/breadcrumb/huidigeKruimel.tsx</code>.
      </>,
    ],
    options: [
      [
        "breadcrumbLabels",
        "Record<string, string>",
        "–",
        "Naam per deel van het pad, zoals berichtenbox: Berichtenbox",
      ],
      [
        "HuidigeKruimel pad / label",
        "string",
        "–",
        "Naam van de huidige pagina, als die niet uit het pad volgt",
      ],
      [
        "BreadcrumbNavLink current",
        "boolean",
        "false",
        "De huidige pagina: geen link, met aria-current",
      ],
    ],
    example: (
      <BreadcrumbNav label="Voorbeeld van een kruimelpad">
        <BreadcrumbNavLink href="/" index={0} rel="home">
          Home
        </BreadcrumbNavLink>
        <BreadcrumbNavSeparator>
          <Icon icon="chevron-right" />
        </BreadcrumbNavSeparator>
        <BreadcrumbNavLink href="/berichtenbox" index={1}>
          Berichtenbox
        </BreadcrumbNavLink>
        <BreadcrumbNavSeparator>
          <Icon icon="chevron-right" />
        </BreadcrumbNavSeparator>
        <BreadcrumbNavLink
          href="/berichtenbox/demo-1"
          index={2}
          current
          disabled
        >
          Uw voorlopige aanslag 2026
        </BreadcrumbNavLink>
      </BreadcrumbNav>
    ),
  },
  {
    name: "Footer",
    file: "src/layouts/footer/index.tsx",
    description:
      "Voettekst met groepen links, gebouwd met RHC Footer, LinkList en rhc-grid. Elke groep is een nav met een eigen kop. Een externe link krijgt een ander icoon en de verborgen tekst ‘opent in nieuw tabblad’.",
    options: [
      [
        "groepen",
        "{ id, kop, links }[]",
        "–",
        "De groepen links; vier naast elkaar op een breed scherm",
      ],
      [
        "links extern",
        "boolean",
        "false",
        "Opent in een nieuw tabblad, met het icoon externe-link",
      ],
    ],
    example: (
      <Footer
        slot1={
          <div className="rhc-grid">
            {(
              [
                {
                  id: "demo-footer-site",
                  heading: "Over deze site",
                  links: [
                    { href: "/toegankelijkheid", label: "Toegankelijkheid" },
                    { href: "/sitemap", label: "Sitemap" },
                  ],
                },
                {
                  id: "demo-footer-partners",
                  heading: "Partners",
                  links: [
                    {
                      href: "https://www.overheid.nl/",
                      label: "Overheid.nl",
                      external: true,
                    },
                  ],
                },
              ] as {
                id: string;
                heading: string;
                links: { href: string; label: string; external?: boolean }[];
              }[]
            ).map(({ id, heading, links }) => (
              <nav
                key={id}
                className="rhc-grid__cell rhc-grid__cell-12 rhc-grid__cell-t-6"
                aria-labelledby={id}
              >
                <h5 id={id}>{heading}</h5>
                <LinkList>
                  {links.map(({ href, label, external }) => (
                    <LinkListLink
                      key={href}
                      href={href}
                      icon={
                        <Icon
                          key="icon"
                          icon={external ? "externe-link" : "chevron-right"}
                        />
                      }
                      {...(external && { target: "_blank", rel: "noreferrer" })}
                    >
                      {label}
                      {external && (
                        <VisuallyHidden>
                          {" "}
                          (opent in nieuw tabblad)
                        </VisuallyHidden>
                      )}
                    </LinkListLink>
                  ))}
                </LinkList>
              </nav>
            ))}
          </div>
        }
        slot2={null}
      />
    ),
  },
  {
    name: "NavigationList en NavigationListItem",
    file: "@/components/rhc",
    description: [
      "Lijst met navigatietegels: elk item is één link met een label, een korte uitleg en een pijl. Gebruikt bij ‘Snel naar’ op de landingspagina.",
      <>
        Met de class <code>rhc-mox-navigation-grid</code> staan de items op een
        breed scherm in twee kolommen, en op een smal scherm onder elkaar.
      </>,
    ],
    options: [
      ["NavigationListItem label", "string", "–", "Naam van de link"],
      [
        "NavigationListItem description",
        "string",
        "–",
        "Korte uitleg onder of naast het label",
      ],
      ["NavigationListItem href", "string", "–", "Adres"],
      [
        "NavigationListItem icon",
        "string",
        "–",
        "Icoon voor het label; leeg in MOx",
      ],
      [
        "rhc-mox-navigation-grid",
        "class op NavigationList",
        "–",
        "Twee kolommen vanaf 768 pixels breed",
      ],
    ],
    example: (
      <NavigationList className="rhc-mox-navigation-grid">
        <NavigationListItem
          label="Berichtenbox"
          description="Berichten van organisaties aan uw bedrijf"
          href="/berichtenbox"
          icon=""
        />
        <NavigationListItem
          label="Lopende zaken"
          description="Aanvragen en meldingen die nog lopen"
          href="/lopendezaken"
          icon=""
        />
        <NavigationListItem
          label="Subsidies en financiering"
          description="Regelingen die bij uw bedrijf passen"
          href="/subsidies"
          icon=""
        />
        <NavigationListItem
          label="Contactvoorkeuren"
          description="Hoe organisaties u bereiken"
          href="/contactvoorkeuren"
          icon=""
        />
      </NavigationList>
    ),
  },
];

const ComponentsDemoPage = () => {
  const [organisation, setOrganisation] = useState("Bloemenkwekerij");
  const [slider, setSlider] = useState(32);
  const countdownRef = useRef<{ reset: () => void }>(null);
  const [countdownDone, setCountdownDone] = useState(0);
  const [autoHideShown, setAutoHideShown] = useState(true);
  const [autoHideRound, setAutoHideRound] = useState(0);

  // <body> sits in the root layout; mark it only while this page is shown.
  useEffect(() => {
    document.body.classList.add("rhc-mox-componenten-demo");
    return () => document.body.classList.remove("rhc-mox-componenten-demo");
  }, []);

  const entries: Entry[] = [
    {
      name: "Alert",
      file: "src/components/Alert.tsx",
      description: (
        <>
          Uitbereiding op{" "}
          <a href="https://rijkshuisstijl-community.vercel.app/?path=/docs/rhc-alert--docs">
            de RHC Alert
          </a>{" "}
          met een sluitknop en de mogelijkheid om vanzelf te verdwijnen als
          extra opties. Importeer via <code>@/components/rhc</code>.
        </>
      ),
      options: [
        [
          "type",
          '"info" | "ok" | "warning" | "error"',
          "info",
          "Soort melding, met het bijbehorende icoon",
        ],
        [
          "closable",
          "boolean",
          "false",
          "Sluitknop. Niet beschikbaar voor een foutmelding (de fout moet eerst opgelost worden).",
        ],
        [
          "closeLabel",
          "string",
          "Melding sluiten",
          "Naam van de sluitknop, zoals een schermlezer die voorleest",
        ],
        [
          "onClose",
          "() => void",
          "–",
          "Actie (een functie die je meegeeft) die wordt uitgevoerd na het sluiten, of als de melding vanzelf verdwenen is. Bijvoorbeeld om de focus op een bepaald element te zetten, of om te onthouden dat iemand de melding heeft weggeklikt, zodat die niet terugkomt.",
        ],
        [
          "autoHide",
          "boolean | number",
          "false",
          "Vanzelf weg: true = leestijd naar de lengte van de tekst (3 tot 15 seconden), een getal = het aantal milliseconden. Niet beschikbaar voor een foutmelding (de fout moet eerst opgelost worden).",
        ],
      ],
      example: (
        <div className="rhc-mox-row-gap">
          <Heading level={5}>Alle soorten</Heading>
          <Alert type="info">
            <Paragraph>Informatie.</Paragraph>
          </Alert>
          <Alert type="ok">
            <Paragraph>
              Success: een actie van de gebruiker of het systeem is succesvol
              afgerond.
            </Paragraph>
          </Alert>
          <Alert type="warning">
            <Paragraph>
              Waarschuwing: de gebruiker moet gewezen worden op iets dat
              misschien problemen geeft.
            </Paragraph>
          </Alert>
          <Alert type="error">
            <Paragraph>
              Fout: er is iets fout gegaan dat hersteld of opnieuw geprobeerd
              moet worden.
            </Paragraph>
          </Alert>
          <Alert type="warning">
            <Paragraph>
              <strong>Met een vetgedrukte eerste regel</strong>
            </Paragraph>
            <Paragraph>
              Een melding kan meerdere alinea&apos;s hebben. Gebruik een Heading
              als de melding een echte kop nodig heeft.
            </Paragraph>
          </Alert>

          <Heading level={5}>Met sluitknop</Heading>
          <Alert type="info" closable>
            <Paragraph>
              <strong>Info-melding met sluitknop</strong>
            </Paragraph>
            <Paragraph>
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Enim,
              perferendis quis. Labore dicta voluptates numquam dolorum, totam
              odio laudantium dolorem beatae magnam. Laborum voluptatum sequi
              fuga iusto rerum distinctio odit.
            </Paragraph>
            <Paragraph>Een tweede paragraaf.</Paragraph>
          </Alert>
          <Alert type="error" closable>
            <Paragraph>
              Een foutmelding kan geen sluitknop krijgen. De fout moet eerst
              hersteld worden.
            </Paragraph>
          </Alert>

          <Heading level={5}>Verdwijnt vanzelf</Heading>
          {autoHideShown ? (
            <Alert
              key={autoHideRound}
              type="ok"
              closable
              autoHide={10000}
              onClose={() => setAutoHideShown(false)}
            >
              <Paragraph>Deze melding verdwijnt na 10 seconden.</Paragraph>
            </Alert>
          ) : (
            <ActionGroup>
              <Button
                appearance="secondary-action-button"
                onClick={() => {
                  setAutoHideRound((n) => n + 1);
                  setAutoHideShown(true);
                }}
              >
                Toon verdwenen melding opnieuw
              </Button>
            </ActionGroup>
          )}
        </div>
      ),
    },
    {
      name: "BarGraph",
      file: "src/components/BarGraph.tsx",
      description:
        "Liggende staafgrafiek. Het label staat aan het begin van de staaf en de waarde aan het einde. Naast kleur maken patronen het verschil tussen de varianten duidelijk, bijvoorbeeld voor gebruikers met kleurenblindheid.",
      options: [
        ["title", "string", "–", "Bijschrift van de grafiek"],
        [
          "items",
          "{ label, value, variant? }[]",
          "–",
          "De staven; variant per staaf mag",
        ],
        ["max", "number", "grootste waarde", "Waarde van een volle staaf"],
        [
          "formatValue",
          "(value) => string",
          "String",
          "Hoe de waarde wordt getoond, zoals 32%",
        ],
        [
          "variant",
          '"neutral" | "positive" | "negative"',
          "neutral",
          "Blauw (effen), groen (strepen) of rood (ruitjes)",
        ],
        [
          "track",
          "boolean",
          "false",
          "Grijze baan zo breed als de langste staaf",
        ],
      ],
      example: (
        <div className="rhc-mox-row-gap">
          <BarGraph
            title="Neutraal"
            items={[
              { label: "Datapunt 1", value: 10 },
              { label: "Datapunt 2", value: 20 },
              { label: "Datapunt 3", value: 50 },
              { label: "Datapunt 4", value: 99 },
            ]}
            formatValue={(value) => value.toLocaleString("nl-NL")}
          />
          <BarGraph
            title="Positief"
            variant="positive"
            items={[
              { label: "Lorem ipsum", value: 12000 },
              { label: "Dolor sit amet", value: 18000 },
              { label: "Consectetur adipiscing elit", value: 38000 },
            ]}
            formatValue={(value) => `${value}%`}
          />
          <BarGraph
            title="Negatief"
            variant="negative"
            items={[
              { label: "Nulla commodo massa eu mi dictum", value: 1 },
              {
                label:
                  "Class aptent taciti sociosqu ad litora torquent per conubia nostra",
                value: 2,
              },
              { label: "Pellentesque lobortis", value: 3 },
            ]}
            formatValue={(value) => `${value}`}
          />
          <BarGraph
            title="Alle varianten"
            items={[
              { label: "Neutraal", value: 100 },
              { label: "Positief", value: 82, variant: "positive" },
              { label: "Negatief", value: 14, variant: "negative" },
            ]}
          />
          <BarGraph
            track
            title="Met baan (track)"
            items={[
              { label: "Negatief", value: 10, variant: "negative" },
              { label: "Neutraal 1", value: 20 },
              { label: "Neutraal 2", value: 50 },
              { label: "Positief", value: 99, variant: "positive" },
            ]}
            formatValue={(value) => value.toLocaleString("nl-NL")}
          />
        </div>
      ),
    },
    {
      name: "Dropdown en DropdownItem",
      file: "src/components/Dropdown.tsx",
      description:
        "Knop met een menu dat bij de trigger opent (popover). Een klik buiten het menu of de Escape-toets sluit het menu. Zoals de organisatiekeuze in de header en de acties in de Berichtenbox.",
      options: [
        ["trigger", "ReactNode", "–", "Inhoud van de knop"],
        [
          "triggerClassName",
          "string",
          "subtiele RHC-knop",
          "Uiterlijk van de knop",
        ],
        [
          "triggerLabel",
          "string",
          "–",
          "Toegankelijke naam als de inhoud niet genoeg zegt",
        ],
        [
          "triggerRef",
          "Ref<HTMLButtonElement>",
          "–",
          "Om de focus later terug te zetten",
        ],
        [
          "align",
          '"start" | "end"',
          "end",
          "Menu aan het begin (links) of het einde (rechts) van de trigger",
        ],
        ["DropdownItem icon", "ReactNode", "–", "Icoon voor de tekst"],
        [
          "DropdownItem selected",
          "boolean",
          "–",
          "Keuze uit meerdere: vinkje en aria-current bij de gekozen optie",
        ],
        [
          "DropdownItem keepOpen",
          "boolean",
          "false",
          "Menu blijft open na de keuze",
        ],
        [
          "DropdownItem onSelect",
          "() => void",
          "–",
          "Actie die wordt uitgevoerd als de gebruiker kiest",
        ],
      ],
      example: (
        <div className="rhc-mox-row-gap">
          <Dropdown
            align="start"
            trigger={
              <>
                Organisatie: {organisation}
                <Icon icon="chevron-down" />
              </>
            }
          >
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
          {/* As the actions of a message in the Berichtenbox: only an icon,
              with the name for screen readers. */}
          <Dropdown
            align="start"
            trigger={
              <>
                <Icon icon="meer" />
                <VisuallyHidden>Acties voor dit bericht</VisuallyHidden>
              </>
            }
          >
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
        "Aftelbalk: een ProgressBar die van vol naar leeg loopt, standaard in 60 seconden. Na afloop roept deze onComplete aan; via een ref begint de ouder opnieuw. Gebruikt op de pagina Contactmomenten.",
      options: [
        [
          "onComplete",
          "() => void",
          "–",
          "Actie die wordt uitgevoerd als de tijd om is",
        ],
        ["seconds", "number", "60", "Duur van één ronde"],
        [
          "label",
          "string",
          "Tijd tot de volgende update",
          "Toegankelijke naam van de balk",
        ],
        ["ref.reset()", "() => void", "–", "Begint opnieuw met de volle tijd"],
      ],
      example: (
        <div className="rhc-mox-row-gap">
          <CountdownBar
            ref={countdownRef}
            onComplete={() => setCountdownDone((n) => n + 1)}
          />
          <Paragraph>Klaar: {countdownDone} keer.</Paragraph>
          <Button
            appearance="secondary-action-button"
            onClick={() => countdownRef.current?.reset()}
          >
            Opnieuw beginnen
          </Button>
        </div>
      ),
    },
    {
      name: "PageNumberNavigation",
      file: "src/components/pageNumberNavigation.tsx",
      description: (
        <>
          Paginering met next/link, gebouwd op{" "}
          <a href="https://rijkshuisstijl-community.vercel.app/?path=/docs/react-components-page-number-navigation--docs">
            RHC PageNumberNavigation
          </a>
          . Elk paginanummer is een link met de pagina in de query, zoals{" "}
          <code>?pagina=2</code>. Op een smal scherm staan er minder links, ,
          zodat de paginering op één regel past.
        </>
      ),
      options: [
        [
          "page",
          "number",
          "",
          'De huidige pagina; voorzien van aria-current="page"',
        ],
        ["totalPages", "number", "", "Het aantal pagina's"],
        [
          "maxVisiblePages",
          "number",
          "",
          "Hoeveel nummers er maximaal staan; de rest wordt een beletselteken (…). Op een smal scherm altijd vijf.",
        ],
        ["queryParam", "string", "pagina", "Naam van de parameter in de link"],
        [
          "query",
          "Record<string, string>",
          "",
          "Andere parameters die in de link blijven, zoals een filter",
        ],
      ],
      example: (
        <>
          <Paragraph>Pagina 1 van 5:</Paragraph>
          <PageNumberNavigation page={1} totalPages={5} />
          <Paragraph>Pagina 6 van 20, met hooguit zeven nummers:</Paragraph>
          <PageNumberNavigation page={6} totalPages={20} maxVisiblePages={7} />
          <Paragraph>Laatste pagina:</Paragraph>
          <PageNumberNavigation
            page={12}
            totalPages={12}
            maxVisiblePages={7}
            query={{ map: "Belastingen" }}
          />
        </>
      ),
    },
    {
      name: "ProgressBar",
      file: "src/components/ProgressBar.tsx",
      description:
        "Voortgangsbalk. Zonder value is de duur onbekend en loopt de balk heen en weer.",
      options: [
        ["label", "string", "–", "Toegankelijke naam, zoals Berichten ophalen"],
        ["value", "number", "–", "Huidige waarde; leeg = duur onbekend"],
        ["max", "number", "100", "Waarde van een volle balk"],
        [
          "valueText",
          "string",
          "–",
          "Wat een schermlezer voorleest, zoals “3 van 14 organisaties”",
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
        ["label", "string", "–", "Zichtbare naam"],
        ["min / max", "number", "–", "Minimale en maximale grens"],
        [
          "value / onChange",
          "number / (value) => void",
          "–",
          "Door de ouder bijgehouden waarde",
        ],
        [
          "defaultValue",
          "number",
          "min",
          "Beginwaarde als de ouder niets bijhoudt",
        ],
        [
          "formatValue",
          "(value) => string",
          "String",
          "Hoe de waarde wordt getoond, zoals ‘32 uur’",
        ],
        [
          "filled",
          "boolean",
          "false",
          "Baan gekleurd vanaf het begin tot aan de knop",
        ],
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
        "Opent het deelvenster van het besturingssysteem. Zonder Web Share API wordt de link gekopieerd.",
      options: [
        ["title", "string", "paginatitel", "Titel om te delen"],
        ["text", "string", "–", "Korte tekst om te delen"],
        ["url", "string", "huidige pagina", "Pad of volledige link"],
        [
          "variant",
          '"link" | "menu"',
          "link",
          "Linkknop, of een item in een Dropdown",
        ],
        [
          "onShared",
          "() => void",
          "–",
          "Actie die uitgevoerd wordt na sluiten van het deelvenster",
        ],
      ],
      example: <ShareButton title="Componenten" />,
    },
    {
      name: "StepIndicator",
      file: "src/components/StepIndicator.tsx",
      description:
        'Stappen van een taak op een rij. Op een smal scherm alleen de tekst en de huidige stap. De huidige stap krijgt aria-current="step".',
      options: [
        ["steps", "string[]", "–", "Namen van de stappen"],
        ["current", "number", "–", "Huidige stap, vanaf 0"],
        ["label", "string", "Voortgang", "Naam van de navigatie"],
      ],
      example: (
        <StepIndicator
          steps={[
            "Stap 1 (voltooid)",
            "Stap 2 (huidige stap)",
            "Stap 3",
            "Stap 4",
          ]}
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
        ["title", "string", "–", "Koptekst"],
        ["headingLevel", "2 | 3 | 4", "2", "Niveau van de koptekst"],
        [
          "children",
          "ReactNode",
          "–",
          "Inhoud; kan alle HTML en React-componenten bevatten",
        ],
      ],
      example: (
        // Text on the left, the box on the right: the box sticks while the
        // text scrolls by, within this card.
        <div className="prototype-demo-sticky">
          <div className="rhc-mox-row-gap">
            {Array.from({ length: 6 }, (_, i) => (
              <Paragraph key={i}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris.
              </Paragraph>
            ))}
          </div>
          <StickyInfoBox title="Koptekst" headingLevel={4}>
            <Paragraph>
              Container met inhoud. Blijft in beeld bij het scrollen.
            </Paragraph>
          </StickyInfoBox>
        </div>
      ),
    },
    {
      name: "Switch",
      file: "src/components/Switch.tsx",
      description: "Schakelaar voor een instelling die direct wordt toegepast.",
      options: [
        ["label", "string", "–", "Zichtbaar label; klikken schakelt ook"],
        [
          "checked / onChange",
          "boolean / (checked) => void",
          "–",
          "Door de ouder bijgehouden stand",
        ],
        ["defaultChecked", "boolean", "false", "Beginstand"],
        ["disabled", "boolean", "false", "Niet te bedienen/inactief"],
        ["onText / offText", "string", "Aan / Uit", "Tekst bij de stand"],
        [
          "twoWay",
          "boolean",
          "false",
          "Keuze tussen twee opties: offText aan het begin (links), onText aan het einde (rechts)",
        ],
      ],
      example: (
        <div className="rhc-mox-row-gap">
          <Switch label="Aan/uit schakelaar" defaultChecked />
          <Switch
            label="Tweekeuze schakelaar"
            twoWay
            offText="Keuze 1"
            onText="Keuze 2"
          />
          <Switch label="Uitgeschakeld" defaultChecked={false} disabled />
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
          "Soort, met icoon en kleur",
        ],
        ["children", "ReactNode", "–", "Tekst in de badge"],
      ],
      example: (
        <Paragraph>
          <TextBadge>Neutraal</TextBadge>{" "}
          <TextBadge variant="info">Informatie</TextBadge>{" "}
          <TextBadge variant="ok">Success</TextBadge>{" "}
          <TextBadge variant="warning">Waarschuwing</TextBadge>{" "}
          <TextBadge variant="error">Fout</TextBadge>
        </Paragraph>
      ),
    },
  ];

  const others: [string, string][] = [
    [
      "ComingSoon",
      "Pagina-inhoud voor een onderdeel dat nog niet beschikbaar is (title, summary, expectations, questions).",
    ],
    [
      "SideOverlay",
      "Paneel dat van rechts inschuift, met sneltoets (id, title, shortcut). Alleen voor demo doeleinden gebruikt door het Flags- en Persona-paneel.",
    ],
    [
      "LanguageSelect",
      "Taalmenu (languages, selectedLanguage, label, withIcon). Bouwt verder op de RHC Language Navigation.",
    ],
    ["ErrorBoundary", "Foutmelding met Opnieuw proberen (error, reset)."],
    ["ContactMoment", "Eén contactmoment in de private route (notification)."],
    [
      "form/FormField, FieldInfo",
      "TanStack Form-veld (houdt staat van formulier bij) gekoppeld aan het RHC-tekstveld (field, label, readOnly).",
    ],
    [
      "icons/*",
      "Pictogrammen die in RHC ontbreken, zoals ArchiveIcon, FolderIcon, CheckIcon en DigitalAssistantIcon.",
    ],
  ];

  const rhcEntries: Entry[] = [
    {
      name: "Heading en Paragraph",
      file: "@/components/rhc",
      description:
        "Koppen en alinea's. Kies het kopniveau naar de structuur van de pagina, niet naar het uiterlijk (zoals de grootte).",
      options: [
        [
          "Heading level",
          "1 – 5",
          "–",
          "Kopniveau (h1 – h5, h6 ontbreekt in RHC)",
        ],
        [
          "Heading appearanceLevel",
          "1 – 5",
          "level",
          "(Optioneel) Kopniveau met de styling van een ander kopniveau",
        ],
        ["Paragraph purpose", '"lead"', "–", "Inleidende alinea, groter"],
      ],
      example: (
        <>
          <Heading level={1}>Een kop van niveau één</Heading>
          <Heading level={2}>Een kop van niveau twee</Heading>
          <Heading level={3}>Een kop van niveau drie</Heading>
          <Heading level={4}>Een kop van niveau vier</Heading>
          <Heading level={5}>Een kop van niveau vijf</Heading>
          <Heading level={5} appearanceLevel={1}>
            Een kop van niveau vijf met de styling van niveau één
          </Heading>
          <Paragraph purpose="lead">Een inleidende alinea.</Paragraph>
          <Paragraph>Een gewone alinea.</Paragraph>
        </>
      ),
    },
    {
      name: "Link en LinkButton",
      file: "@/components/rhc",
      description:
        "Link naar een andere pagina; LinkButton is een knop met de opmaak van een link, voor een actie op de pagina.",
      options: [
        ["Link href", "string", "–", "Adres"],
        ["Link inline", "boolean", "false", "Link in lopende tekst"],
        [
          "LinkButton pressed",
          "boolean",
          "false",
          "Ingedrukt (aria-pressed), voor een aan/uit-actie",
        ],
        [
          "LinkButton inline",
          "boolean",
          "false",
          "Zonder padding en minimale maat, in lopende tekst",
        ],
      ],
      example: (
        <>
          <Paragraph>
            Link naar{" "}
            <Link inline href="#">
              een andere pagina
            </Link>
            .
          </Paragraph>
          <ActionGroup>
            <LinkButton>
              <Icon icon="delen" />
              Delen
            </LinkButton>
            <LinkButton pressed>
              <Icon icon="favoriet" />
              Bewaard
            </LinkButton>
          </ActionGroup>
        </>
      ),
    },
    {
      name: "Button, IconButton en ActionGroup",
      file: "@/components/rhc",
      description: "Knoppen voor een actie, gegroepeerd in een <ActionGroup>.",
      options: [
        [
          "Button appearance",
          '"primary-action-button" | "secondary-action-button" | "subtle-button"',
          "–",
          "Soort knop",
        ],
        [
          "Button hint",
          '"danger" | "warning" | "ready"',
          "–",
          "Waarschuwende variant, zoals voor verwijderen",
        ],
        [
          "Button disabled / busy",
          "boolean",
          "false",
          "Niet te bedienen / bezig",
        ],
        ["Button pressed", "boolean", "–", "Ingedrukt (aria-pressed)"],
        [
          "IconButton icon / label",
          "RHC-icoon / string",
          "–",
          "Knop met alleen een icoon; label is de tekst die een schermlezer voorleest",
        ],
        [
          "ActionGroup direction",
          '"row" | "column"',
          "row",
          "Knoppen naast of onder elkaar",
        ],
      ],
      example: (
        <ActionGroup>
          <Button appearance="primary-action-button">Primaire actie</Button>
          <Button appearance="secondary-action-button">Secundaire actie</Button>
          <Button appearance="secondary-action-button" hint="danger">
            Destructieve actie
          </Button>
          <Button appearance="subtle-button">Subtiele knop</Button>
          <IconButton icon="kruis" label="Sluiten" />
        </ActionGroup>
      ),
    },
    {
      name: "Icon",
      file: "@/components/rhc",
      description:
        "Iconen uit de RHC-set; ontbrekende iconen staan in src/components/icons.",
      options: [
        [
          "icon",
          "RHC-icoonnaam",
          "–",
          "Welk icoon, zoals home, favoriet of kruis",
        ],
      ],
      example: (
        <Paragraph>
          <Icon icon="home" /> <Icon icon="favoriet" /> <Icon icon="delen" />{" "}
          <Icon icon="kruis" /> <Icon icon="info-circle" />
        </Paragraph>
      ),
    },
    {
      name: "DataSummary en DataSummaryItem",
      file: "@/components/rhc",
      description:
        "Gegevens als naam en waarde, zoals bij een wet of subsidie.",
      options: [
        [
          "DataSummary appearance",
          '"row" | "column"',
          "row",
          "Naam en waarde naast of onder elkaar",
        ],
        [
          "DataSummaryItem itemKey / itemValue",
          "string",
          "–",
          "Naam en waarde",
        ],
        ["DataSummaryItem href", "string", "–", "Waarde als link"],
      ],
      example: (
        <DataSummary appearance="row">
          <DataSummaryItem itemKey="Bron" itemValue="Rijksoverheid" />
          <DataSummaryItem itemKey="In werking" itemValue="1 juli 2023" />
        </DataSummary>
      ),
    },
    {
      name: "Table",
      file: "@/components/rhc",
      description:
        "Tabel met <TableHeader>, <TableBody>, <TableRow>, <TableHeaderCell> en <TableCell>. Zet hem in .rhc-mox-table-container om op een smal scherm te scrollen.",
      options: [
        ["children", "Table-onderdelen", "–", "Zoals een gewone HTML-tabel"],
        [
          "Sorteren",
          "<th aria-sort> + Button",
          "–",
          "Kolomkop met knop en pijl; aria-sort op de cel (ascending, descending, none)",
        ],
        [
          ".rhc-mox-row-linked",
          "class op TableRow",
          "–",
          "Hele rij klikbaar via de link met .rhc-mox-row-linked__link",
        ],
        [
          ".rhc-mox-unread",
          "class op de link",
          "–",
          "Ongelezen vet; zet 'Ongelezen' erbij voor schermlezers met VisuallyHidden",
        ],
        [
          ".rhc-mox-table-container",
          "wrapper",
          "–",
          "Scrollt de tabel op een smal scherm",
        ],
        [
          "Acties per rij",
          "Dropdown",
          "–",
          "Knop met een menu in de laatste kolom",
        ],
      ],
      example: (
        <div className="rhc-mox-row-gap">
          <Heading level={5}>Eenvoudige tabel</Heading>
          <div className="rhc-mox-table-container">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell scope="col">Lorem</TableHeaderCell>
                  <TableHeaderCell scope="col">Ipsum</TableHeaderCell>
                  <TableHeaderCell scope="col">Dolor</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {SIMPLE_ROWS.map(([first, second, third]) => (
                  <TableRow key={first}>
                    <TableCell>{first}</TableCell>
                    <TableCell>{second}</TableCell>
                    <TableCell>{third}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Heading level={5}>
            Tabel met sorteerbare kolommen en actiemenu
          </Heading>
          <DemoTable />
        </div>
      ),
    },
    {
      name: "UnorderedList en OrderedList",
      file: "@/components/rhc",
      description: "Opsomming en genummerde lijst.",
      options: [
        ["UnorderedList nested", "boolean", "false", "Lijst binnen een lijst"],
      ],
      example: (
        <>
          <UnorderedList>
            <UnorderedListItem>Eerste punt</UnorderedListItem>
            <UnorderedListItem>Tweede punt</UnorderedListItem>
          </UnorderedList>
          <OrderedList>
            <OrderedListItem>Stap één</OrderedListItem>
            <OrderedListItem>Stap twee</OrderedListItem>
          </OrderedList>
          <Paragraph>Genummerde lijst in een opsomming:</Paragraph>
          <UnorderedList>
            <UnorderedListItem>
              Een vergunning aanvragen
              <OrderedList>
                <OrderedListItem>Log in met eHerkenning</OrderedListItem>
                <OrderedListItem>Vul het formulier in</OrderedListItem>
                <OrderedListItem>Verstuur uw aanvraag</OrderedListItem>
              </OrderedList>
            </UnorderedListItem>
            <UnorderedListItem>Een melding doen</UnorderedListItem>
          </UnorderedList>
          <Paragraph>Opsomming in een genummerde lijst:</Paragraph>
          <OrderedList>
            <OrderedListItem>
              Verzamel uw gegevens
              <UnorderedList nested>
                <UnorderedListItem>KVK-nummer</UnorderedListItem>
                <UnorderedListItem>Btw-nummer</UnorderedListItem>
              </UnorderedList>
            </OrderedListItem>
            <OrderedListItem>Vul de aangifte in</OrderedListItem>
          </OrderedList>
        </>
      ),
    },
    {
      name: "LinkList en LinkListLink",
      file: "@/components/rhc",
      description:
        "Lijst met links, elk met een icoon, onder andere gebruikt voor de links in de footer.",
      options: [
        [
          "LinkListLink icon",
          "ReactNode",
          "–",
          "Icoon voor de link, zoals chevron-right",
        ],
      ],
      example: (
        <LinkList>
          <LinkListLink href="/wetten" icon={<Icon icon="chevron-right" />}>
            Wetten en regelgeving
          </LinkListLink>
          <LinkListLink href="/subsidies" icon={<Icon icon="chevron-right" />}>
            Subsidies en financiering
          </LinkListLink>
        </LinkList>
      ),
    },
    {
      name: "AccordionProvider",
      file: "@/components/rhc",
      description: "Uitklapbare onderdelen, zoals veelgestelde vragen.",
      options: [
        ["sections", "{ label, body, expanded? }[]", "–", "De onderdelen"],
        [
          "headingLevel",
          "number",
          "1 (!)",
          "Kopniveau van de labels; zet dit altijd, anders worden het h1's",
        ],
      ],
      example: (
        <AccordionProvider
          headingLevel={5}
          sections={[
            {
              label: "Wat is MijnOverheid Zakelijk?",
              body: (
                <Paragraph>De plek voor uw zaken met de overheid.</Paragraph>
              ),
            },
            {
              label: "Hoe log ik in?",
              body: <Paragraph>Met eHerkenning.</Paragraph>,
            },
          ]}
        />
      ),
    },
    {
      name: "Formuliervelden",
      file: "@/components/rhc",
      description:
        "<FormFieldTextInput> en <FormFieldTextarea>: velden om tekst in te vullen. Om te kiezen, zie Keuze-elementen.",
      options: [
        ["label", "ReactNode", "–", "Label van het veld"],
        ["description", "ReactNode", "–", "Uitleg onder het label"],
        [
          "invalid / errorMessage",
          "boolean / string",
          "–",
          "Fout tonen bij het veld",
        ],
        ["status", "ReactNode", "–", "Extra informatie onder het veld"],
        ["inputRef", "Ref", "–", "Om de focus te zetten"],
      ],
      example: (
        <div className="rhc-mox-row-gap">
          <FormFieldTextInput
            label="Naam"
            description="Zoals in uw paspoort."
          />
          <FormFieldTextInput
            label="E-mailadres"
            invalid
            errorMessage="Vul een geldig e-mailadres in."
          />
          <FormFieldTextarea
            label="Toelichting"
            placeholder="Het tekstveld kan alleen in hoogte worden vergroot, zodat de horizontale opmaak niet breekt."
          />
        </div>
      ),
    },
    {
      name: "Keuze-elementen",
      file: "@/components/rhc",
      description:
        "<FormFieldSelect> (keuzelijst), <FormFieldRadio> (één keuze uit enkele opties) en <FormFieldCheckboxOption> (aan- of uitvinken), gegroepeerd met <Fieldset>.",
      options: [
        ["label", "ReactNode", "–", "Label van de keuze"],
        ["description", "ReactNode", "–", "Uitleg bij de keuze"],
        [
          "invalid / errorMessage",
          "boolean / string",
          "–",
          "Fout tonen bij de keuze",
        ],
        [
          "FormFieldSelect selectRef",
          "Ref<HTMLSelectElement>",
          "–",
          "Om de toetsenbordfocus te zetten",
        ],
        [
          "SelectOption value",
          "string",
          "–",
          "Waarde van een optie in de keuzelijst",
        ],
        [
          "FormFieldRadio name / value",
          "string",
          "–",
          "Radiobuttons met hetzelfde name-attribuut horen bij elkaar",
        ],
        [
          "checked / defaultChecked",
          "boolean",
          "false",
          "Gekozen of aangevinkt",
        ],
        ["Fieldset legend", "ReactNode", "–", "Koptekst van een groep keuzes"],
      ],
      example: (
        <div className="rhc-mox-row-gap">
          <FormFieldSelect label="Taalvoorkeur" defaultValue="nl">
            <SelectOption value="nl">Nederlands</SelectOption>
            <SelectOption value="en">English (Engels)</SelectOption>
          </FormFieldSelect>
          <Fieldset legend="Hoe wilt u bericht krijgen?">
            <FormFieldRadio
              name="demo-kanaal"
              value="mail"
              label="E-mail"
              defaultChecked
            />
            <FormFieldRadio name="demo-kanaal" value="post" label="Post" />
            <FormFieldRadio name="demo-kanaal" value="sms" label="Sms" />
          </Fieldset>
          <Fieldset legend="Over welke onderwerpen wilt u berichten?">
            <FormFieldCheckboxOption label="Belastingen" defaultChecked />
            <FormFieldCheckboxOption label="Subsidies en financiering" />
            <FormFieldCheckboxOption label="Wetten en regelgeving" />
            <FormFieldCheckboxOption label="Berichten over uw buurt" />
          </Fieldset>
          <FormFieldCheckboxOption label="Ik ga akkoord" />
        </div>
      ),
    },
    {
      name: "NumberBadge",
      file: "@/components/rhc",
      description:
        "Teller, zoals het aantal ongelezen berichten in het navigatiemenu. Zet de betekenis erbij met <VisuallyHidden>, anders hoort een schermlezer alleen een getal zonder context.",
      options: [["children", "number", "–", "Het getal"]],
      example: (
        <Paragraph>
          Berichtenbox <NumberBadge>16</NumberBadge>
          <VisuallyHidden> ongelezen</VisuallyHidden>
        </Paragraph>
      ),
    },
    {
      name: "Separator",
      file: "@/components/rhc",
      description: "Scheidingslijn tussen groepen, zoals in het navigatiemenu.",
      options: [
        ["invisible", "boolean", "false", "Ruimte zonder zichtbare lijn"],
      ],
      example: (
        <>
          <Paragraph>Content boven de lijn.</Paragraph>
          <Separator />
          <Paragraph>Content onder de lijn.</Paragraph>
        </>
      ),
    },
    {
      name: "VisuallyHidden",
      file: "@/components/rhc",
      description:
        "Tekst die niet te zien is, maar wel wordt voorgelezen door schermlezers. Bijvoorbeeld om een knop met alleen een icoon of een korte linktekst aan te vullen.",
      options: [
        [
          "children",
          "ReactNode",
          "–",
          "Tekst die alleen schermlezers voorlezen",
        ],
      ],
      example: (
        <div className="rhc-mox-row-gap">
          <ActionGroup>
            <Button appearance="subtle-button">
              <Icon icon="meer" />
              <VisuallyHidden>Acties voor dit bericht</VisuallyHidden>
            </Button>
          </ActionGroup>
          <Paragraph>
            <Icon icon="paperclip" />
            <VisuallyHidden>Heeft bijlage</VisuallyHidden>
          </Paragraph>
          <Paragraph>
            Een schermlezer leest hier “Acties voor dit bericht, knop” en “Heeft
            bijlage(n)”, zoals in de Berichtenbox.
          </Paragraph>
        </div>
      ),
    },
  ];

  const rhcLayout: [string, string][] = [
    ["SkipLink", "Link Naar de hoofdinhoud (src/app/layout.tsx)."],
    [
      "LanguageNavigation",
      "Taalmenu, via LanguageSelect (src/components/languageSelect.tsx).",
    ],
    [
      "Drawer",
      "Paneel dat inschuift, via SideOverlay (Flags- en persona-paneel).",
    ],
  ];

  const cssEntries: Entry[] = [
    {
      name: "Card",
      file: "rhc-mox-card",
      description:
        "Witte kaart met rand en schaduw, voor een blok inhoud. Kop, tekst en knoppen erin krijgen ruimte; een ActionGroup als laatste zakt naar de onderkant, zodat knoppen in kaarten naast elkaar gelijk staan.",
      options: [
        ["rhc-mox-card", "class", "–", "Op <section> of <div>"],
        [
          "rhc-grid__cell-…",
          "class erbij",
          "–",
          "Kaarten naast elkaar in een rhc-grid",
        ],
        [
          "aria-labelledby",
          "id van de kop",
          "–",
          "Geef de sectie een toegankelijke naam via de koptekst",
        ],
      ],
      example: (
        <section className="rhc-mox-card" aria-labelledby="demo-card-kop">
          <Heading level={4} id="demo-card-kop">
            Subsidies en financiering
          </Heading>
          <Paragraph>
            Er is 1 nieuwe subsidie die interessant kan zijn.
          </Paragraph>
          <ActionGroup>
            <NextLink
              href="/subsidies"
              className="utrecht-button-link utrecht-button-link--html-a utrecht-button-link--primary-action"
            >
              Naar Subsidies en financiering
            </NextLink>
          </ActionGroup>
        </section>
      ),
    },
    {
      name: "FAQ-kaart",
      file: "mox-faq-card (mox.css)",
      description:
        "Kaart met veelgestelde vragen, onder de koptekst ‘Veelgestelde vragen’.",
      options: [
        ["mox-faq-card", "class", "–", "Om <AccordionProvider> heen"],
        [
          "headingLevel",
          "number",
          "–",
          "Eén niveau onder de kop erboven, meestal niveau 3",
        ],
      ],
      example: (
        <div className="mox-faq-card">
          <AccordionProvider
            headingLevel={5}
            sections={[
              {
                label: "Wat is MijnOverheid Zakelijk?",
                body: (
                  <Paragraph>De plek voor uw zaken met de overheid.</Paragraph>
                ),
              },
              {
                label: "Hoe log ik in?",
                body: <Paragraph>Met eHerkenning.</Paragraph>,
              },
            ]}
          />
        </div>
      ),
    },
    {
      name: "Tabs",
      file: "rhc-mox-tabs, rhc-mox-tab (rhc.css)",
      description:
        "Tabbladen als navigatie tussen pagina's, zoals in de Berichtenbox en bij Lopende zaken. Op een smal scherm of bij veel tabbladen scrollen ze, met een verloop aan de uiteinden.",
      options: [
        ["nav aria-label", "string", "–", "Naam van de tabbladen"],
        ["ul.rhc-mox-tabs", "class", "–", "De lijst"],
        ["a.rhc-mox-tab", "class", "–", "Elk tabblad, met icoon en tekst"],
        ['aria-current="page"', "attribuut", "–", "Het actieve tabblad"],
        [
          "li.rhc-mox-tabs-separator",
          "class",
          "–",
          "Scheiding tussen groepen, zoals voor de mappen",
        ],
      ],
      example: (
        <nav aria-label="Voorbeeld tabbladen">
          <ul className="rhc-mox-tabs">
            <li>
              <NextLink
                href="/demo"
                aria-current="page"
                className="rhc-mox-tab utrecht-link utrecht-link--html-a"
              >
                <Icon icon="inbox" />
                Inbox
              </NextLink>
            </li>
            <li>
              <NextLink
                href="/demo"
                className="rhc-mox-tab utrecht-link utrecht-link--html-a"
              >
                <ArchiveIcon />
                Archief
              </NextLink>
            </li>
            <li className="rhc-mox-tabs-separator">
              <VisuallyHidden>Mappen:</VisuallyHidden>
            </li>
            <li>
              <NextLink
                href="/demo"
                className="rhc-mox-tab utrecht-link utrecht-link--html-a"
              >
                <FolderIcon />
                Belastingen 2023
              </NextLink>
            </li>
            <li>
              <NextLink
                href="/demo"
                className="rhc-mox-tab utrecht-link utrecht-link--html-a"
              >
                <FolderIcon />
                Belastingen 2024
              </NextLink>
            </li>
            <li>
              <NextLink
                href="/demo"
                className="rhc-mox-tab utrecht-link utrecht-link--html-a"
              >
                <FolderIcon />
                Belastingen 2025
              </NextLink>
            </li>
            <li>
              <NextLink
                href="/demo"
                className="rhc-mox-tab utrecht-link utrecht-link--html-a"
              >
                <FolderIcon />
                Belastingen 2026
              </NextLink>
            </li>
          </ul>
        </nav>
      ),
    },
    {
      name: "Actiebalk (compact)",
      file: "rhc-mox-action-group-dense (rhc.css)",
      description:
        "Grijze balk met kleine acties als LinkButtons, zoals bij een wet of subsidie. Bewaren en Niet relevant komen uit src/components/save.",
      options: [
        [
          "rhc-mox-action-group-dense",
          "class op ActionGroup",
          "–",
          'Samen met role="group" en direction="row"',
        ],
        [
          "BewaarKnop / NietRelevantKnop alsLink",
          "boolean",
          "false",
          "Als LinkButton in de actiebalk; anders een secundaire knop",
        ],
        [
          "BewaarKnop item",
          "BewaarItem",
          "–",
          "Wat er bewaard wordt (sleutel, categorie, titel, samenvatting, href)",
        ],
      ],
      example: (
        <>
          <ActionGroup
            role="group"
            direction="row"
            className="rhc-mox-action-group-dense"
          >
            <BewaarKnop item={DEMO_SAVE_ITEM} alsLink />
            <LinkButton>
              <Icon icon="delen" />
              Delen
            </LinkButton>
            <NietRelevantKnop item={DEMO_SAVE_ITEM} alsLink />
          </ActionGroup>
          <Paragraph>
            ℹ️ Bewaren werkt echt: het voorbeeld komt bij Bewaarde items te
            staan.
          </Paragraph>
        </>
      ),
    },
    {
      name: "Meter",
      file: "rhc-mox-graph-meter (rhc.css)",
      description:
        "Eén waarde binnen een bereik, zoals het vergeven budget van een subsidie: een ProgressBar met de waarde ernaast.",
      options: [
        [
          "rhc-mox-graph-meter",
          "class",
          "–",
          "Om de ProgressBar en de waarde heen",
        ],
        [
          "ProgressBar value / valueText",
          "number / string",
          "–",
          "Stand en de tekst die een schermlezer voorleest",
        ],
      ],
      example: (
        <div className="rhc-mox-graph-meter">
          <ProgressBar
            label="Budget vergeven"
            value={64}
            valueText="64% vergeven"
          />
          <span aria-hidden="true">64%</span>
        </div>
      ),
    },
    {
      name: "Dialoog",
      file: "rhc-mox-dialog (rhc.css)",
      description:
        "Modaal venster op een gewoon dialog-element, geopend met showModal(). De Escape-toets sluit de dialoog.",
      options: [
        [
          "rhc-mox-dialog",
          "class op <dialog>",
          "–",
          "Opmaak van het venster en de achtergrond",
        ],
        ["aria-labelledby", "id van de kop", "–", "Naam van de dialoog"],
        ["showModal() / close()", "methode", "–", "Openen en sluiten"],
      ],
      example: <DemoDialog />,
    },
    {
      name: "StatusTrack",
      file: "src/components/StatusTrack.tsx",
      description:
        "Verloop van een zaak in stappen onder elkaar, elk uit te klappen, zoals bij Lopende zaken.",
      options: [
        [
          "stappen",
          "DemoZaakStap[]",
          "–",
          "titel, soort, datum, open, tekst, waarschuwing, aanleveren",
        ],
        [
          "soort",
          '"voltooid" | "huidig" | "volgende" | "later" | "afgerond"',
          "–",
          'Vinkje, huidige stap (aria-current="step") of nog te doen',
        ],
      ],
      example: <StatusTrack stappen={DEMO_STEPS} />,
    },
    {
      name: "Lay-outhulpen",
      file: "rhc-mox-main-container, rhc-mox-row-gap (rhc.css)",
      description:
        "Ruimte tussen blokken. Deze demopagina gebruikt rhc-mox-main-container tussen de kaarten.",
      options: [
        [
          "rhc-mox-main-container",
          "class",
          "–",
          "Grid met ruimte (space-xl) tussen de kinderen; de hoofdinhoud van elke pagina",
        ],
        [
          "rhc-mox-row-gap",
          "class",
          "–",
          "Grid met ruimte tussen de kinderen, binnen een kaart of formulier",
        ],
      ],
    },
  ];

  return (
    <>
      {/* Sticky and without height of its own: the switch sits next to the
          heading and stays in view while you scroll. */}
      <div className="prototype-demo-brand-switch">
        <div className="prototype-demo-brand-switch__box">
          <BrandSwitch />
        </div>
      </div>
      <Heading level={1}>Componenten</Heading>
      <Alert type="info">
        <Paragraph>
          Overzicht van maatwerkcomponenten in src/components en aangepaste{" "}
          <a
            href="https://rijkshuisstijl-community.vercel.app/?path=/docs/react-components-readme--docs"
            rel="extrenal"
          >
            RHC componenten
          </a>
          , met hun opties en een voorbeeld.
        </Paragraph>
      </Alert>

      <div className="rhc-mox-main-container">
        <Heading level={2}>Maatwerkcomponenten</Heading>
        {entries.map(card)}
        <section className="rhc-mox-card" aria-labelledby="overige">
          <Heading level={3} id="overige">
            Overige maatwerkcomponenten
          </Heading>
          <Paragraph>
            Voor één plek of voor het prototype; zonder voorbeeld.
          </Paragraph>
          <SimpleTable rows={others} />
        </section>

        <Heading level={2}>CSS-patronen</Heading>
        {cssEntries.map(card)}

        <Heading level={2}>RHC-componenten</Heading>
        {rhcEntries.map(card)}
        <section className="rhc-mox-card" aria-labelledby="rhc-layout">
          <Heading level={3} id="rhc-layout">
            RHC-componenten in de layout
          </Heading>
          <Paragraph>
            Gebruikt in header, menu en footer; zonder voorbeeld.
          </Paragraph>
          <SimpleTable rows={rhcLayout} />
        </section>

        <Heading level={2}>Layout</Heading>
        {layoutEntries.map(card)}

        <Heading level={2}>Berichtenbox</Heading>
        {berichtenboxEntries.map(card)}

        <Heading level={2}>(AI) chat interface</Heading>
        {assistantEntries.map(card)}
      </div>
    </>
  );
};

export default ComponentsDemoPage;
