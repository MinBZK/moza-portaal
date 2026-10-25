import { components } from "@/network/omc/generated";

/** Statuses with their own colour; the rest gets the default colour. */
const statusClass: Record<string, string> = {
  Accepted: "mox-status--accepted",
  PermanentFailure: "mox-status--permanent-failure",
};

const ContactMoment = ({
  notification,
}: {
  notification: components["schemas"]["Notificatie"];
}) => {
  const date = new Date(notification.createdAt!);
  const sendAt = date.toLocaleString("nl-NL", {
    timeZone: "Europe/Amsterdam",
    dateStyle: "short",
    timeStyle: "short",
  });

  return (
    <div>
      {/* The colour repeats the status below; the text carries the information. */}
      <span
        aria-hidden="true"
        className={`mox-status ${statusClass[notification.status ?? ""] ?? ""}`}
      />
      <div>
        <div>
          <div>Scenario 8 met kanaalherstel</div>
          <time>{sendAt}</time>
        </div>
        <div>Status: {notification.status}</div>
        <div>Medium: {notification.type}</div>

        <div>UWV</div>
      </div>
    </div>
  );
};

export default ContactMoment;
