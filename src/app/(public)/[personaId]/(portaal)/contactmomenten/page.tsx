import type { Metadata } from "next";
import ContactMoment from "@/components/ContactMoment";
import { Heading } from "@/components/rhc";
import type { components } from "@/network/omc/generated";

export const metadata: Metadata = { title: "Contactmomenten" };

/**
 * Temporary: the contact moments of (private)/contactmomenten with demo data,
 * so the page can be viewed without Keycloak and the OMC service.
 */
const NOTIFICATIONS: components["schemas"]["Notificatie"][] = [
  {
    id: "demo-1",
    status: "Accepted",
    type: "Email",
    createdAt: "2026-11-03T09:15:00Z",
  },
  {
    id: "demo-2",
    status: "Delivered",
    type: "Sms",
    createdAt: "2026-11-02T14:40:00Z",
  },
  {
    id: "demo-5",
    status: "TemporaryFailure",
    type: "Sms",
    createdAt: "2026-10-31T11:30:00Z",
  },
  {
    id: "demo-3",
    status: "PermanentFailure",
    type: "Email",
    createdAt: "2026-10-30T08:05:00Z",
  },
  {
    id: "demo-6",
    status: "Cancelled",
    type: "Email",
    createdAt: "2026-10-29T10:00:00Z",
  },
  {
    id: "demo-4",
    status: "Sending",
    type: "Sms",
    createdAt: "2026-10-28T16:20:00Z",
  },
];

const ContactmomentenPage = () => (
  <>
    <Heading level={1}>Contactmomenten</Heading>
    <div className="rhc-mox-card">
      <ol className="rhc-mox-timeline">
        {NOTIFICATIONS.map((notification, index) => (
          <ContactMoment
            notification={notification}
            open={index === 0}
            key={notification.id}
          />
        ))}
      </ol>
    </div>
  </>
);

export default ContactmomentenPage;
