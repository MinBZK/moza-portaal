import { DataSummary, DataSummaryItem } from "@/components/rhc";
import TimelineItem, { type TimelineStatus } from "@/components/TimelineItem";
import { components } from "@/network/omc/generated";

/** Visible name per medium; the API gives an English code. */
const MEDIUM: Record<components["schemas"]["NotificationTypes"], string> = {
  Email: "E-mail",
  Sms: "Sms",
  Unknown: "Onbekend",
};

/** Delivery statuses with their own state; the rest is info. */
const STATUS: Partial<
  Record<components["schemas"]["DeliveryStatuses"], TimelineStatus>
> = {
  Accepted: "ok",
  Delivered: "ok",
  TemporaryFailure: "warning",
  PermanentFailure: "error",
  TechnicalFailure: "error",
  Cancelled: "neutral",
};

const ContactMoment = ({
  notification,
  open = false,
}: {
  notification: components["schemas"]["Notificatie"];
  /** Expanded by default, as for the most recent contact moment. */
  open?: boolean;
}) => {
  const date = new Date(notification.createdAt!);
  const sendAt = date.toLocaleString("nl-NL", {
    timeZone: "Europe/Amsterdam",
    dateStyle: "long",
    timeStyle: "short",
  });

  return (
    <TimelineItem
      title="Scenario 8 met kanaalherstel"
      open={open}
      date={<time dateTime={notification.createdAt}>{sendAt}</time>}
      status={(notification.status && STATUS[notification.status]) || "info"}
    >
      <DataSummary appearance="column">
        <DataSummaryItem
          itemKey="Status"
          itemValue={notification.status ?? "Onbekend"}
        />
        <DataSummaryItem
          itemKey="Medium"
          itemValue={notification.type ? MEDIUM[notification.type] : "Onbekend"}
        />
        <DataSummaryItem itemKey="Organisatie" itemValue="UWV" />
      </DataSummary>
    </TimelineItem>
  );
};

export default ContactMoment;
