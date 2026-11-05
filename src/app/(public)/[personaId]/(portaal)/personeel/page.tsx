import type { Metadata } from "next";
import Link from "next/link";
import { Heading, Paragraph } from "@/components/rhc";
import {
  getDemoIemandAannemenSituaties,
  getDemoPersoneelsonderwerpen,
} from "@/demo";
import PersoneelZaak from "./iemand-aannemen/_personeelZaak";

export const metadata: Metadata = { title: "Personeel en rollen" };

/** Personeel: onderwerpen over personeel; alleen Iemand aannemen is uitgewerkt. */
const PersoneelPage = async () => {
  const [situaties, onderwerpen] = await Promise.all([
    getDemoIemandAannemenSituaties(),
    getDemoPersoneelsonderwerpen(),
  ]);
  return (
    <>
      <Heading level={1}>Personeel</Heading>

      <ul className="rhc-grid rhc-mox-plain-list">
        {onderwerpen.map(({ id, titel, samenvatting, href }) => (
          <li
            key={id}
            className="rhc-mox-card rhc-grid__cell rhc-grid__cell-t-6"
          >
            <Heading level={2}>
              {href ? (
                <Link href={href} className="utrecht-link utrecht-link--html-a">
                  {titel}
                </Link>
              ) : (
                titel
              )}
            </Heading>
            <Paragraph>{samenvatting}</Paragraph>
          </li>
        ))}
      </ul>

      <PersoneelZaak
        zaken={{
          gemeente: situaties.gemeente.zaak,
          wajong: situaties.wajong.zaak,
          wia: situaties.wia.zaak,
        }}
      />
    </>
  );
};

export default PersoneelPage;
