import { DataSummary, DataSummaryItem } from "@/components/rhc";
import TimelineItem, { type TimelineStatus } from "@/components/TimelineItem";
import { components } from "@/network/omc/generated";

/** Visible name per medium; the API gives an English code. */
const MEDIUM: Record<components["schemas"]["NotificationTypes"], string> = {
  Email: "E-mail",
  Sms: "Sms",
  Unknown: "Onbekend",
};

/** Visible name per delivery status; the API gives an English code. */
const STATUS_LABEL: Record<components["schemas"]["DeliveryStatuses"], string> =
  {
    Unknown: "Onbekend",
    Created: "Wordt verstuurd",
    Sending: "Wordt verstuurd",
    Pending: "Wordt verstuurd",
    Sent: "Verstuurd",
    Accepted: "Verstuurd",
    Delivered: "Afgeleverd",
    Received: "Afgeleverd",
    Cancelled: "Geannuleerd",
    PermanentFailure: "Mislukt",
    TemporaryFailure: "Tijdelijk mislukt",
    TechnicalFailure: "Mislukt",
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
      title={
        notification.type && notification.type !== "Unknown"
          ? `Bericht van UWV via ${MEDIUM[notification.type].toLowerCase()}`
          : "Bericht van UWV"
      }
      open={open}
      date={<time dateTime={notification.createdAt}>{sendAt}</time>}
      status={(notification.status && STATUS[notification.status]) || "info"}
    >
      <DataSummary appearance="column">
        <DataSummaryItem
          itemKey="Status"
          itemValue={
            notification.status ? STATUS_LABEL[notification.status] : "Onbekend"
          }
        />
        <DataSummaryItem
          itemKey="Kanaal"
          itemValue={notification.type ? MEDIUM[notification.type] : "Onbekend"}
        />
        <DataSummaryItem itemKey="Organisatie" itemValue="UWV" />
      </DataSummary>
    </TimelineItem>
  );
};

export default ContactMoment;
