"use client";

// Overview of the project's own components (src/components, not RHC), with
// their options and a live example. Prototype page: delete the folder
// (demo) when it is no longer needed; nothing else links to it.
import {
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
  Button,
  DataSummary,
  DataSummaryItem,
  Fieldset,
  FormFieldCheckboxOption,
  FormFieldRadio,
  FormFieldTextInput,
  Heading,
  Icon,
  Link,
  LinkButton,
  LinkList,
  LinkListLink,
  NumberBadge,
  OrderedList,
  OrderedListItem,
  Paragraph,
  Separator,
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
import ProgressBar from "@/components/ProgressBar";
import RangeSlider from "@/components/RangeSlider";
import ShareButton from "@/components/ShareButton";
import StepIndicator from "@/components/StepIndicator";
import StatusTrack, { type StatusStep } from "@/components/StatusTrack";
import StickyInfoBox from "@/components/StickyInfoBox";
import { BewaarKnop, NietRelevantKnop } from "@/components/save/saveActions";
import type { BewaarItem } from "@/components/save/useSaved";
import NextLink from "next/link";
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
    <div className="mox-table-container">
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
      {description} <code>{file}</code>
    </Paragraph>
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
  <div className="mox-table-container">
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
    <div className="mox-table-container">
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
      ["bericht", "DemoBericht", "", "Het bericht."],
      ["ongelezen", "boolean", "", "Vet, met een stip en de tekst Ongelezen."],
      [
        "gemarkeerd",
        "boolean",
        "",
        "Gevulde vlag; de knop krijgt aria-pressed.",
      ],
      ["nieuw", "boolean", "false", "Net binnengekomen: licht kort op."],
      ["onMarkeer", "() => void", "", "Klik op de vlag (rhc-mox-button-mark)."],
      ["children", "ReactNode", "", "Extra cellen achteraan, zoals acties."],
    ],
    example: <DemoMessageRows />,
  },
  {
    name: "Filterbalk",
    file: "rhc-mox-inbox-filters in src/styles/rhc.css",
    description:
      "Zoekveld en keuzelijst naast elkaar boven de inbox. Daaronder het aantal berichten (rhc-mox-notice-amount-inbox).",
    options: [
      ["rhc-mox-inbox-filters", "class", "", "Zet de velden naast elkaar."],
      [
        "rhc-mox-notice-amount-inbox",
        "class",
        "",
        "Regel met het aantal berichten en organisaties.",
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
        "Aantal organisaties, hoeveel er klaar zijn en hoeveel berichten er gevonden zijn.",
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
        "Kader om kop, uitleg en knoppen.",
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
      "Modale dialog om een map te kiezen of een nieuwe map te maken. Na sluiten gaat de focus terug naar de knop.",
    options: [
      ["open", "boolean", "", "Toon de dialog."],
      ["mappen", "string[]", "", "Bestaande mappen."],
      ["huidige", "string | null", "", "De map waarin het bericht nu staat."],
      ["opener", "HTMLElement | null", "", "Krijgt de focus na sluiten."],
      [
        "onKies",
        "(map) => string | null | Promise",
        "",
        "Geeft null als het lukte, anders een foutmelding.",
      ],
      ["onSluit", "() => void", "", "Na sluiten."],
    ],
    example: <DemoFolderDialog />,
  },
  {
    name: "PdfVoorbeeld",
    file: "src/app/(public)/[personaId]/(portaal)/berichtenbox/_pdfVoorbeeld.tsx",
    description:
      "Het bericht als pdf in de pagina, met links om het te downloaden of als tekst te lezen (variant B).",
    options: [
      ["pdf", "string", "", "Adres van de pdf."],
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
        "{ opnieuw }: met opnieuw ook de knop 'Uitleg opnieuw tonen'.",
      ],
      ["onVraag", "(vraag) => void", "", "Klik op een voorbeeldvraag."],
      ["onUitleg", "() => void", "", "Klik op 'Uitleg opnieuw tonen'."],
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
        "Grens voor het energieverbruik na delen.",
      ],
      ["onDelen", "() => void", "", "Klik op Delen."],
      ["onNietDelen", "() => void", "", "Klik op Niet delen."],
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
      ["rhc-mox-chat", "class", "", "Kaart om het hele gesprek."],
      [
        "rhc-mox-chat-messages",
        "class",
        "",
        "Lijst met berichten; scrolt bij een lang gesprek.",
      ],
      [
        "rhc-mox-chat-rule",
        "class",
        "",
        "Eén bericht; zet een vraag rechts en een antwoord links.",
      ],
      ["rhc-mox-chat-input", "class", "", "Invoerveld met knoppen."],
      ["rhc-mox-chat-disclaimer", "class", "", "Uitleg over AI, met icoon."],
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

const ComponentsDemoPage = () => {
  const [organisation, setOrganisation] = useState("Bloemenkwekerij");
  const [slider, setSlider] = useState(32);
  const countdownRef = useRef<{ reset: () => void }>(null);
  const [countdownDone, setCountdownDone] = useState(0);
  const [autoHideShown, setAutoHideShown] = useState(true);
  const [autoHideRound, setAutoHideRound] = useState(0);

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
          <Heading level={5}>Alle soorten</Heading>
          <Alert type="info">
            <Paragraph>Informatie.</Paragraph>
          </Alert>
          <Alert type="ok">
            <Paragraph>Gelukt: uw gegevens zijn opgeslagen.</Paragraph>
          </Alert>
          <Alert type="warning">
            <Paragraph>
              Let op: uw e-mailadres is nog niet geverifieerd.
            </Paragraph>
          </Alert>
          <Alert type="error">
            <Paragraph>
              Fout: uw gegevens zijn niet opgeslagen. Probeer het opnieuw.
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
            <Paragraph>Info-melding met sluitknop.</Paragraph>
          </Alert>
          <Alert type="error" closable>
            <Paragraph>
              Een foutmelding kan geen sluitknop krijgen, de betreffende fout
              dient eerst actief hersteld te worden.
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
            Klaar: {countdownDone} keer.
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
        "Opent het deelvenster van het systeem; zonder Web Share API wordt de link gekopieerd.",
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
        ["title", "string", "–", "Kop van het kader."],
        ["headingLevel", "2 | 3 | 4", "2", "Niveau van de kop."],
        ["children", "ReactNode", "–", "Inhoud."],
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
          <StickyInfoBox title="StickyInfoBox koptekst" headingLevel={4}>
            <Paragraph>
              Inhoud van de StickyInfoBox. Blijft in beeld bij scrollen.
            </Paragraph>
          </StickyInfoBox>
        </div>
      ),
    },
    {
      name: "Switch",
      file: "src/components/Switch.tsx",
      description: "Schakelaar voor een instelling die direct toegepast wordt.",
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
          "Soort, met icoon en kleur.",
        ],
        ["children", "ReactNode", "–", "De tekst."],
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
    [
      "PageNumberNavigation",
      "Paginering met next/link (page, totalPages, maxVisiblePages, queryParam, query).",
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
        "Koppen en alinea's. Kies het kopniveau naar de structuur van de pagina, niet naar de grootte.",
      options: [
        [
          "Heading level",
          "1 – 5",
          "–",
          "Kopniveau (h1 – h5, h6 ontbreekt in RHC).",
        ],
        [
          "Heading appearanceLevel",
          "1 – 5",
          "level",
          "(Optioneel) Kopniveau met styling van een ander niveau.",
        ],
        ["Paragraph purpose", '"lead"', "–", "Inleidende alinea, groter."],
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
        ["Link href", "string", "–", "Adres."],
        ["Link inline", "boolean", "false", "Link in lopende tekst."],
        [
          "LinkButton pressed",
          "boolean",
          "false",
          "Ingedrukt (aria-pressed), voor een aan/uit-actie.",
        ],
        [
          "LinkButton inline",
          "boolean",
          "false",
          "Zonder padding en minimale maat, in lopende tekst.",
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
      description: "Knoppen voor een actie, gegroepeerd in een ActionGroup.",
      options: [
        [
          "Button appearance",
          '"primary-action-button" | "secondary-action-button" | "subtle-button"',
          "–",
          "Soort knop.",
        ],
        [
          "Button hint",
          '"danger" | "warning" | "ready"',
          "–",
          "Waarschuwende variant, zoals voor verwijderen.",
        ],
        [
          "Button disabled / busy",
          "boolean",
          "false",
          "Niet te bedienen / bezig.",
        ],
        ["Button pressed", "boolean", "–", "Ingedrukt (aria-pressed)."],
        [
          "IconButton icon / label",
          "RHC-icoon / string",
          "–",
          "Knop met alleen een icoon; label is de naam voor schermlezers.",
        ],
        [
          "ActionGroup direction",
          '"row" | "column"',
          "row",
          "Knoppen naast of onder elkaar.",
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
        "Iconen uit RHC-set; ontbrekende iconen staan in src/components/icons.",
      options: [
        [
          "icon",
          "RHC-icoonnaam",
          "–",
          "Welk icoon, zoals home, favoriet of kruis.",
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
          "Naam en waarde naast of onder elkaar.",
        ],
        [
          "DataSummaryItem itemKey / itemValue",
          "string",
          "–",
          "Naam en waarde.",
        ],
        ["DataSummaryItem href", "string", "–", "Waarde als link."],
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
        "Tabel met TableHeader, TableBody, TableRow, TableHeaderCell en TableCell. Zet hem in .mox-table-container om op een smal scherm te scrollen.",
      options: [
        ["children", "Table-onderdelen", "–", "Zoals een gewone HTML-tabel."],
        [
          "Sorteren",
          "<th aria-sort> + Button",
          "–",
          "Kolomkop met knop en pijl; aria-sort op de cel (ascending, descending, none).",
        ],
        [
          ".rhc-mox-row-linked",
          "class op TableRow",
          "–",
          "Hele rij klikbaar via de link met .rhc-mox-row-linked__link.",
        ],
        [
          ".rhc-mox-unread",
          "class op de link",
          "–",
          "Ongelezen vet; zet Ongelezen erbij met VisuallyHidden.",
        ],
        [
          ".mox-table-container",
          "wrapper",
          "–",
          "Scrollt de tabel op een smal scherm.",
        ],
        [
          "Acties per rij",
          "Dropdown",
          "–",
          "Knop met een menu in de laatste kolom.",
        ],
      ],
      example: (
        <div className="rhc-mox-row-gap">
          <Heading level={5}>Eenvoudige tabel</Heading>
          <div className="mox-table-container">
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
        ["UnorderedList nested", "boolean", "false", "Lijst binnen een lijst."],
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
        </>
      ),
    },
    {
      name: "LinkList en LinkListLink",
      file: "@/components/rhc",
      description: "Lijst met links, elk met een icoon, zoals in de footer.",
      options: [
        [
          "LinkListLink icon",
          "ReactNode",
          "–",
          "Icoon voor de link, zoals chevron-right.",
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
        ["sections", "{ label, body, expanded? }[]", "–", "De onderdelen."],
        [
          "headingLevel",
          "number",
          "1 (!)",
          "Kopniveau van de labels; zet dit altijd, anders worden het h1's.",
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
        "FormFieldTextInput en FormFieldTextarea: velden om tekst in te typen. Voor kiezen, zie Keuze-elementen.",
      options: [
        ["label", "ReactNode", "–", "Label van het veld."],
        ["description", "ReactNode", "–", "Uitleg onder het label."],
        [
          "invalid / errorMessage",
          "boolean / string",
          "–",
          "Fout tonen bij het veld.",
        ],
        ["status", "ReactNode", "–", "Extra informatie onder het veld."],
        ["inputRef", "Ref", "–", "Om de focus te zetten."],
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
        "FormFieldSelect (keuzelijst), FormFieldRadio (één keuze uit enkele opties) en FormFieldCheckboxOption (aan- of uitvinken), gegroepeerd met Fieldset.",
      options: [
        ["label", "ReactNode", "–", "Label van de keuze."],
        ["description", "ReactNode", "–", "Uitleg bij de keuze."],
        [
          "invalid / errorMessage",
          "boolean / string",
          "–",
          "Fout tonen bij de keuze.",
        ],
        [
          "FormFieldSelect selectRef",
          "Ref<HTMLSelectElement>",
          "–",
          "Om de focus te zetten.",
        ],
        [
          "SelectOption value",
          "string",
          "–",
          "Waarde van een optie in de keuzelijst.",
        ],
        [
          "FormFieldRadio name / value",
          "string",
          "–",
          "Radio's met dezelfde name horen bij elkaar.",
        ],
        [
          "checked / defaultChecked",
          "boolean",
          "false",
          "Gekozen of aangevinkt.",
        ],
        ["Fieldset legend", "ReactNode", "–", "Kop van een groep keuzes."],
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
        "Teller, zoals het aantal ongelezen berichten in het menu. Zet de betekenis erbij met VisuallyHidden, anders hoort een schermlezer alleen een getal.",
      options: [["children", "number", "–", "Het getal."]],
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
      description: "Scheidingslijn tussen groepen, zoals in het menu.",
      options: [
        ["invisible", "boolean", "false", "Ruimte zonder zichtbare lijn."],
      ],
      example: (
        <>
          <Paragraph>Boven de lijn.</Paragraph>
          <Separator />
          <Paragraph>Onder de lijn.</Paragraph>
        </>
      ),
    },
    {
      name: "VisuallyHidden",
      file: "@/components/rhc",
      description:
        "Tekst die niet te zien is, maar wel wordt voorgelezen. Bijvoorbeeld om een knop met alleen een icoon of een korte linktekst aan te vullen.",
      options: [
        ["children", "ReactNode", "–", "Tekst alleen voor schermlezers."],
      ],
      example: (
        <div className="rhc-mox-row-gap">
          <ActionGroup>
            {/* Only an icon is visible; a screen reader reads the text. */}
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
    ["NavBar, Logo", "Header (src/layouts/header): logo en navigatiebalk."],
    [
      "SideNav, SideNavList, SideNavItem, SideNavLink",
      "Menu links (src/layouts/navigation); SideNavLink current en icon.",
    ],
    [
      "BreadcrumbNav, BreadcrumbNavLink, BreadcrumbNavSeparator",
      "Kruimelpad (src/layouts/breadcrumb).",
    ],
    ["Footer", "Voettekst met links (src/layouts/footer)."],
    ["SkipLink", "Link Naar de hoofdinhoud (src/app/layout.tsx)."],
    [
      "LanguageNavigation",
      "Taalmenu, via LanguageSelect (src/components/languageSelect.tsx).",
    ],
    [
      "PageNumberNavigation",
      "Paginering, via src/components/pageNumberNavigation.tsx.",
    ],
    [
      "Drawer",
      "Paneel dat inschuift, via SideOverlay (Flags- en persona-paneel).",
    ],
    [
      "NavigationList, NavigationListItem",
      "Lijst met navigatietegels, zoals op de landingspagina.",
    ],
  ];

  const cssEntries: Entry[] = [
    {
      name: "Card",
      file: "rhc-mox-card (rhc.css, mox.css)",
      description:
        "Witte kaart met rand en schaduw, voor een blok inhoud. Kop, tekst en knoppen erin krijgen ruimte; een ActionGroup als laatste zakt naar de onderkant, zodat knoppen in kaarten naast elkaar gelijk staan.",
      options: [
        ["rhc-mox-card", "class", "–", "Op een section of div."],
        [
          "rhc-grid__cell-…",
          "class erbij",
          "–",
          "Kaarten naast elkaar in een rhc-grid.",
        ],
        [
          "aria-labelledby",
          "id van de kop",
          "–",
          "Geef de section een naam via zijn kop.",
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
        "Kaart met veelgestelde vragen in een AccordionProvider, onder een kop Veelgestelde vragen.",
      options: [
        ["mox-faq-card", "class", "–", "Om de AccordionProvider heen."],
        [
          "headingLevel",
          "number",
          "–",
          "Eén niveau onder de kop erboven, meestal 3.",
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
        "Tabbladen als navigatie tussen pagina's, zoals in de Berichtenbox en bij Lopende zaken. Op een smal scherm scrollen ze, met een verloop aan de randen.",
      options: [
        ["nav aria-label", "string", "–", "Naam van de tabbladen."],
        ["ul.rhc-mox-tabs", "class", "–", "De lijst."],
        ["a.rhc-mox-tab", "class", "–", "Elk tabblad, met icoon en tekst."],
        ['aria-current="page"', "attribuut", "–", "Het actieve tabblad."],
        [
          "li.rhc-mox-tabs-separator",
          "class",
          "–",
          "Scheiding tussen groepen, zoals voor de mappen.",
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
          'Samen met role="group" en direction="row".',
        ],
        [
          "BewaarKnop / NietRelevantKnop alsLink",
          "boolean",
          "false",
          "Als LinkButton in deze balk; anders een secundaire knop.",
        ],
        [
          "BewaarKnop item",
          "BewaarItem",
          "–",
          "Wat er bewaard wordt (sleutel, categorie, titel, samenvatting, href).",
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
            Bewaren werkt echt: het voorbeeld komt bij Bewaarde items te staan.
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
          "Om de ProgressBar en de waarde heen.",
        ],
        [
          "ProgressBar value / valueText",
          "number / string",
          "–",
          "Stand en voorgelezen tekst.",
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
        "Modaal venster op een gewoon dialog-element, geopend met showModal(). Escape sluit het.",
      options: [
        [
          "rhc-mox-dialog",
          "class op <dialog>",
          "–",
          "Opmaak van het venster en de achtergrond.",
        ],
        ["aria-labelledby", "id van de kop", "–", "Naam van de dialoog."],
        ["showModal() / close()", "methode", "–", "Openen en sluiten."],
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
          "titel, soort, datum, open, tekst, waarschuwing, aanleveren.",
        ],
        [
          "soort",
          '"voltooid" | "huidig" | "volgende" | "later" | "afgerond"',
          "–",
          'Vinkje, huidige stap (aria-current="step") of nog te doen.',
        ],
      ],
      example: <StatusTrack stappen={DEMO_STEPS} />,
    },
    {
      name: "Lay-outhulpen",
      file: "rhc-mox-main-container, rhc-mox-row-gap (rhc.css)",
      description:
        "Ruimte tussen blokken. Deze pagina gebruikt rhc-mox-main-container tussen de kaarten.",
      options: [
        [
          "rhc-mox-main-container",
          "class",
          "–",
          "Grid met ruimte (xl) tussen de kinderen; de hoofdinhoud van elke pagina.",
        ],
        [
          "rhc-mox-row-gap",
          "class",
          "–",
          "Grid met ruimte tussen de kinderen, binnen een kaart of formulier.",
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

        <Heading level={2}>Berichtenbox</Heading>
        {berichtenboxEntries.map(card)}

        <Heading level={2}>(AI) chat interface</Heading>
        {assistantEntries.map(card)}
      </div>
    </>
  );
};

export default ComponentsDemoPage;
