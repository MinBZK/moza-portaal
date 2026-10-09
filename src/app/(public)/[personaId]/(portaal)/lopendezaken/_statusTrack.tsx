import {
  ActionGroup,
  Alert,
  Icon,
  OrderedList,
  OrderedListItem,
  Paragraph,
  VisuallyHidden,
} from "@/components/rhc";
import type { DemoZaakStap } from "@/demo";

const voorvoegsel: Record<DemoZaakStap["soort"], string> = {
  voltooid: "Voltooide stap: ",
  huidig: "Huidige stap: ",
  volgende: "Volgende stap: ",
  later: "Nog te nemen stap: ",
  afgerond: "Afgerond: ",
};

/** Voortgang van een zaak als genummerde stappen, zoals in moza-poc. */
const StatusTrack = ({ stappen }: { stappen: DemoZaakStap[] }) => (
  <ol className="mox-status-track">
    {stappen.map((stap) => (
      <li
        key={stap.titel}
        aria-current={stap.soort === "huidig" ? "step" : undefined}
      >
        <details open={stap.open}>
          <summary>
            <VisuallyHidden>{voorvoegsel[stap.soort]}</VisuallyHidden>
            {stap.titel}
            <Icon icon="chevron-right" />
          </summary>
          <div className="mox-status-details">
            {stap.datum && (
              <Paragraph className="mox-status-date">
                <Icon icon="kalender" />
                {stap.datum}
              </Paragraph>
            )}
            {stap.waarschuwing && (
              <Alert type="warning">
                <Paragraph>{stap.waarschuwing}</Paragraph>
              </Alert>
            )}
            {stap.tekst?.map((tekst) => (
              <Paragraph key={tekst}>{tekst}</Paragraph>
            ))}
            {stap.aanleveren && (
              <>
                <Paragraph>{stap.aanleveren.intro}</Paragraph>
                <OrderedList>
                  {stap.aanleveren.items.map((item) => (
                    <OrderedListItem key={item}>{item}</OrderedListItem>
                  ))}
                </OrderedList>
                <ActionGroup>
                  {/* Schets uit moza-poc: aanleveren doet nog niets. */}
                  <a
                    href="#"
                    className="utrecht-button-link utrecht-button-link--html-a utrecht-button-link--primary-action"
                  >
                    {stap.aanleveren.knop}
                  </a>
                </ActionGroup>
              </>
            )}
          </div>
        </details>
      </li>
    ))}
  </ol>
);

export default StatusTrack;
