/**
 * The components on the demo page, with their kind. The page and the side
 * navigation both use this list, so they always show the same components.
 */

export type ComponentKind = "custom" | "rhc" | "rhc-adapted";

export const KIND_LABELS: Record<ComponentKind, string> = {
  custom: "Eigen component",
  rhc: "RHC-component",
  "rhc-adapted": "Aangepaste RHC-component",
};

export const DEMO_COMPONENTS = {
  AccordionProvider: "rhc-adapted",
  "Actiebalk (compact)": "rhc-adapted",
  Alert: "rhc-adapted",
  Article: "rhc",
  BarGraph: "custom",
  BerichtRij: "custom",
  Breadcrumb: "rhc-adapted",
  Bronnen: "custom",
  "Button, IconButton en ActionGroup": "rhc",
  Card: "custom",
  "ChangedValue en ChangedValueGroup": "custom",
  CountdownBar: "custom",
  "DataSummary en DataSummaryItem": "rhc",
  Deelverzoek: "custom",
  Denkt: "custom",
  Dialoog: "custom",
  DotBadge: "rhc",
  "Dropdown en DropdownItem": "custom",
  ExpandableCheckboxGroup: "rhc",
  "FAQ-kaart": "custom",
  FileInput: "rhc",
  Filterbalk: "custom",
  Footer: "custom",
  "FormFieldRadioGroup en FormFieldCheckboxGroup": "rhc",
  "Gebruiker en Assistent": "custom",
  Gesprek: "custom",
  Header: "custom",
  "Heading en Paragraph": "rhc",
  Hero: "rhc",
  Highlight: "custom",
  Icon: "rhc",
  "InfoToggletip, FieldLabel en Fieldset": "rhc-adapted",
  Invoervelden: "rhc",
  "Keuze-elementen": "rhc",
  "Kleine tekst": "custom",
  "Lay-outhulpen": "custom",
  "Link en LinkButton": "rhc",
  "LinkList en LinkListLink": "rhc",
  MapDialog: "custom",
  Meter: "custom",
  Navigatie: "custom",
  "NavigationList en NavigationListItem": "rhc",
  NumberBadge: "rhc",
  OphaalVoortgang: "custom",
  PageNumberNavigation: "rhc-adapted",
  Paginagrid: "custom",
  PdfVoorbeeld: "custom",
  PreHeading: "rhc",
  ProgressBar: "custom",
  RangeSlider: "custom",
  Separator: "rhc",
  ShareButton: "custom",
  SiteSearch: "custom",
  Spinner: "custom",
  StatusTrack: "custom",
  StepIndicator: "custom",
  StepNavigation: "custom",
  StickyInfoBox: "custom",
  Suggesties: "custom",
  Switch: "custom",
  Table: "rhc",
  Tabs: "custom",
  TextBadge: "custom",
  TimelineItem: "custom",
  "UnorderedList en OrderedList": "rhc",
  VisuallyHidden: "rhc",
  "Wat kunt u doen?": "custom",
} satisfies Record<string, ComponentKind>;

export type DemoComponentName = keyof typeof DEMO_COMPONENTS;

/** Lists on the demo page without an example, after the components. */
export const DEMO_LISTS = [
  { id: "overige", name: "Overige eigen componenten" },
  { id: "rhc-layout", name: "RHC-componenten in de layout" },
  { id: "rhc-unused", name: "RHC-componenten die wij nog niet gebruiken" },
] as const;

/** Anchor of a component on the demo page. */
export const demoId = (name: string) =>
  name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const collator = new Intl.Collator("nl", { sensitivity: "base" });

/** The component names in alphabetical order. */
export const DEMO_COMPONENT_NAMES = (
  Object.keys(DEMO_COMPONENTS) as DemoComponentName[]
).sort(collator.compare);
