import { components } from "@/network/omc/generated";

/** Statussen met een eigen kleur; de rest krijgt de standaardkleur. */
const statusKlasse: Record<string, string> = {
  Accepted: "mox-status--accepted",
  PermanentFailure: "mox-status--permanent-failure",
};

const ContactMoment = ({
  notificatie,
}: {
  notificatie: components["schemas"]["Notificatie"];
}) => {
  const date = new Date(notificatie.createdAt!);
  const sendAt = date.toLocaleString("nl-NL", {
    timeZone: "Europe/Amsterdam",
    dateStyle: "short",
    timeStyle: "short",
  });

  return (
    <div>
      {/* Kleur herhaalt de status hieronder; de tekst is de informatie. */}
      <span
        aria-hidden="true"
        className={`mox-status ${statusKlasse[notificatie.status ?? ""] ?? ""}`}
      />
      <div>
        <div>
          <div>Scenario 8 met kanaalherstel</div>
          <time>{sendAt}</time>
        </div>
        <div>Status: {notificatie.status}</div>
        <div>Medium: {notificatie.type}</div>

        <div>UWV</div>
      </div>
    </div>
  );
};

export default ContactMoment;
