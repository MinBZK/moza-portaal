import {
  ActionGroup,
  Alert,
  Icon,
  OrderedList,
  OrderedListItem,
  Paragraph,
  VisuallyHidden,
} from "@/components/rhc";
import { CalendarIcon } from "@/components/icons/calendarIcon";
import { CheckIcon } from "@/components/icons/checkIcon";

/** One step of a case. The demo data (StatusStep) has the same shape. */
export type StatusStep = {
  titel: string;
  /** Afgerond = last step of a finished case. */
  soort: "voltooid" | "huidig" | "volgende" | "later" | "afgerond";
  /** Date as text, sometimes with "sinds" or "verwacht voor". */
  datum?: string;
  /** Expanded by default. */
  open?: boolean;
  tekst?: string[];
  /** Something is expected from the entrepreneur. */
  waarschuwing?: string;
  /** Information the entrepreneur still has to supply. */
  aanleveren?: { intro: string; items: string[]; knop: string };
};

const voorvoegsel: Record<StatusStep["soort"], string> = {
  voltooid: "Voltooide stap: ",
  huidig: "Huidige stap: ",
  volgende: "Volgende stap: ",
  later: "Nog te nemen stap: ",
  afgerond: "Afgerond: ",
};

/** Voortgang van een zaak als genummerde stappen, zoals in moza-poc. */
const StatusTrack = ({ stappen }: { stappen: StatusStep[] }) => (
  <ol className="rhc-mox-status-track">
    {stappen.map((stap, index) => (
      <li
        key={stap.titel}
        aria-current={stap.soort === "huidig" ? "step" : undefined}
      >
        {/* Alleen beeld: de soort stap staat al in de verborgen tekst. */}
        <span className="rhc-mox-status-marker" aria-hidden="true">
          {stap.soort === "voltooid" || stap.soort === "afgerond" ? (
            <CheckIcon />
          ) : (
            index + 1
          )}
        </span>
        <details open={stap.open}>
          <summary>
            <VisuallyHidden>{voorvoegsel[stap.soort]}</VisuallyHidden>
            {stap.titel}
            <Icon icon="chevron-right" />
          </summary>
          <div className="rhc-mox-status-details">
            {stap.datum && (
              <Paragraph className="rhc-mox-status-date">
                <CalendarIcon />
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
