import { components } from "@/network/omc/generated";

/** Statuses with their own colour; the rest gets the default colour. */
const statusClass: Record<string, string> = {
  Accepted: " rhc-mox-timeline__item--ok",
  PermanentFailure: " rhc-mox-timeline__item--error",
};

const ContactMoment = ({
  notification,
}: {
  notification: components["schemas"]["Notificatie"];
}) => {
  const date = new Date(notification.createdAt!);
  const sendAt = date.toLocaleString("nl-NL", {
    timeZone: "Europe/Amsterdam",
    dateStyle: "long",
    timeStyle: "short",
  });

  return (
    // The colour of the dot repeats the status below; the text carries it.
    <li
      className={`rhc-mox-timeline__item${statusClass[notification.status ?? ""] ?? ""}`}
    >
      <div>
        <div>Scenario 8 met kanaalherstel</div>
        <time>{sendAt}</time>
      </div>
      <div>Status: {notification.status}</div>
      <div>Medium: {notification.type}</div>

      <div>UWV</div>
    </li>
  );
};

export default ContactMoment;
