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
  const onderwerp = "Aanslag belastingen 2025";
  return (
    <TableRow>
      <TableCell>
        <input
          type="checkbox"
          aria-label={`Bericht selecteren: ${onderwerp}`}
          className="utrecht-checkbox utrecht-checkbox--html-input utrecht-checkbox--custom"
        />
      </TableCell>
      <TableCell>
        <span
          className={
            ongelezen ? "rhc-mox-sender rhc-mox-unread" : "rhc-mox-sender"
          }
        >
          {ongelezen && (
            <>
              <span aria-hidden="true" className="rhc-mox-status-unread" />
              <VisuallyHidden>Ongelezen.</VisuallyHidden>
            </>
          )}
          Belastingdienst
        </span>
      </TableCell>
      <TableCell>
        <span className={ongelezen ? "rhc-mox-unread" : undefined}>
          {onderwerp}
        </span>
      </TableCell>
      <TableCell className="rhc-mox-table-cell-date">
        21 februari 2025
      </TableCell>
      <TableCell>
        <Icon icon="paperclip" />
        <VisuallyHidden>Heeft bijlage</VisuallyHidden>
      </TableCell>
    </TableRow>
  );
};

const tabs = [
  { status: "inbox", label: "Ontvangen", href: "/berichtenbox" },
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
        <div className="rhc-grid__cell rhc-grid__cell-d-8 rhc-mox-row-gap">
          <div className="rhc-mox-card">
            <nav aria-label="Berichtenbox">
              <ul className="rhc-mox-tabs">
                {tabs.map((tab) => (
                  <li key={tab.status}>
                    <Link
                      href={tab.href}
                      aria-current={status === tab.status ? "page" : undefined}
                      className="rhc-mox-tab utrecht-link utrecht-link--html-a"
                    >
                      {tab.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="rhc-mox-table-container">
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
                Naar Ontvangen verplaatsen
              </Button>
              <Button appearance="subtle-button" disabled>
                <ArchiveIcon />
                Naar archief verplaatsen
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

          <div className="rhc-mox-card">
            <Heading level={2}>Uw e-mailadres(sen) aanpassen</Heading>
            <Paragraph>
              Wilt u uw e-mailadressen voor meldingen aanpassen? Of kiezen welke
              organisaties u digitaal berichten mogen sturen? Dit regelt u bij
              Contactgegevens.
            </Paragraph>
            <LinkList>
              <LinkListLink
                href="/bedrijfsprofiel"
                icon={<Icon key="icoon" icon="chevron-right" />}
              >
                Naar uw contactgegevens
              </LinkListLink>
            </LinkList>
          </div>
        </div>
        <div className="rhc-mox-card rhc-grid__cell rhc-grid__cell-d-4">
          <Heading level={2}>Machtigingen</Heading>
          <Paragraph>U kunt hier uw machtiging ophalen en gebruiken.</Paragraph>
          <LinkList>
            <LinkListLink
              href="#"
              icon={<Icon key="icoon" icon="chevron-right" />}
            >
              Machtigingen ophalen
            </LinkListLink>
          </LinkList>

          <Alert type="info">
            <Paragraph>
              Ontdek hoe u gemachtigd kunt worden om berichten van iemand anders
              te lezen.
            </Paragraph>
          </Alert>
        </div>
      </div>
    </>
  );
};

export default BerichtenboxPage;
