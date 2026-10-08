import {
  ActionGroup,
  Alert,
  Button,
  FormFieldCheckboxOption,
  Heading,
  Icon,
  LinkList,
  LinkListLink,
  Paragraph,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  VisuallyHidden,
} from "@/components/rhc";
import { ArchiveIcon } from "@/components/icons/archiveIcon";
import PageNumberNavigation from "@/components/pageNumberNavigation";
import Link from "next/link";

export const BerichtenboxTableRow = ({ index }: { index: number }) => {
  const ongelezen = index === 0;
  return (
    <TableRow>
      <TableCell>
        <input
          type="checkbox"
          aria-label="Selecteer bericht"
          className="utrecht-checkbox utrecht-checkbox--html-input utrecht-checkbox--custom"
        />
      </TableCell>
      <TableCell>
        <span
          className={ongelezen ? "mox-afzender mox-ongelezen" : "mox-afzender"}
        >
          {ongelezen && (
            <>
              <span aria-hidden="true" className="mox-status-unread" />
              <VisuallyHidden>Ongelezen.</VisuallyHidden>
            </>
          )}
          Belastingdienst
        </span>
      </TableCell>
      <TableCell>
        <span className={ongelezen ? "mox-ongelezen" : undefined}>
          Aanslag belastingen 2025
        </span>
      </TableCell>
      <TableCell>21/02/2025</TableCell>
      <TableCell>
        <Icon icon="paperclip" />
        <VisuallyHidden>Heeft bijlage</VisuallyHidden>
      </TableCell>
    </TableRow>
  );
};

const tabs = [
  { status: "inbox", label: "Inbox", href: "/berichtenbox" },
  { status: "archief", label: "Archief", href: "/berichtenbox/archief" },
  {
    status: "prullenbak",
    label: "Prullenbak",
    href: "/berichtenbox/prullenbak",
  },
];

const BerichtenboxPage = async ({
  params,
}: {
  params: Promise<{ status: string }>;
}) => {
  const { status } = await params;

  // staat een redirect in proxy.ts dat /berichtenbox -> /berichtenbox/inbox gaat
  return (
    <>
      <Heading level={1}>Mijn Berichtenbox</Heading>
      <div className="rhc-grid">
        <div className="rhc-grid__cell rhc-grid__cell-d-8 mox-row-gap">
          <div className="mox-card">
            <nav aria-label="Berichtenbox">
              <ul className="mox-tabs">
                {tabs.map((tab) => (
                  <li key={tab.status}>
                    <Link
                      href={tab.href}
                      aria-current={status === tab.status ? "page" : undefined}
                      className="mox-tab utrecht-link utrecht-link--html-a"
                    >
                      {tab.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="mox-table-container">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHeaderCell scope="col">
                      <VisuallyHidden>Selecteren</VisuallyHidden>
                    </TableHeaderCell>
                    <TableHeaderCell scope="col">Afzender</TableHeaderCell>
                    <TableHeaderCell scope="col">Onderwerp</TableHeaderCell>
                    <TableHeaderCell scope="col">Ontvangen</TableHeaderCell>
                    <TableHeaderCell scope="col">
                      <VisuallyHidden>Bijlage</VisuallyHidden>
                    </TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from(Array(10).keys()).map((x) => (
                    <BerichtenboxTableRow index={x} key={x} />
                  ))}
                </TableBody>
              </Table>
            </div>
            <FormFieldCheckboxOption label="(de)selecteer alle berichten" />
            <ActionGroup direction="row">
              <Button appearance="subtle-button" disabled>
                <Icon icon="inbox" />
                Verplaats naar inbox
              </Button>
              <Button appearance="subtle-button" disabled>
                <ArchiveIcon />
                Verplaats naar archief
              </Button>
            </ActionGroup>
            <PageNumberNavigation page={1} totalPages={5} />

            <Alert type="info">
              <Paragraph>
                Meer informatie over de berichtenbox. Uw zakelijke brievenbus
                van de overheid.
              </Paragraph>
            </Alert>
          </div>

          <div className="mox-card">
            <Heading level={2}>Uw e-mailadres(sen) aanpassen</Heading>
            <Paragraph>
              Wilt u de e-mailadres(sen) waarop u meldingen ontvangt aanpassen
              of aanpassen welke organisaties u digitaal berichten mogen sturen?
              Dit staat onder Bedrijfsprofiel.
            </Paragraph>
            <LinkList>
              <LinkListLink
                href="/bedrijfsprofiel"
                icon={<Icon key="icoon" icon="chevron-right" />}
              >
                Ga naar bedrijfsprofiel
              </LinkListLink>
            </LinkList>
          </div>
        </div>
        <div className="mox-card rhc-grid__cell rhc-grid__cell-d-4">
          <Heading level={2}>Bent u gemachtigd voor iemand anders?</Heading>
          <Paragraph>U kunt hier uw machtiging ophalen en gebruiken.</Paragraph>
          <LinkList>
            <LinkListLink
              href="#"
              icon={<Icon key="icoon" icon="chevron-right" />}
            >
              Haal machtigingen op
            </LinkListLink>
          </LinkList>

          <Alert type="info">
            <Paragraph>
              Ontdek hoe u gemachtigd kunt worden om digitale post van iemand
              anders te lezen.
            </Paragraph>
          </Alert>
        </div>
      </div>
    </>
  );
};

export default BerichtenboxPage;
