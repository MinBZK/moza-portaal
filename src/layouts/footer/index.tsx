"use client";

import {
  LinkList,
  Footer as RhsFooter,
} from "@rijkshuisstijl-community/components-react";
import { Icon } from "@/components/nl-design-system";
import { LinkListLink } from "@/components/nl-design-system/nextIntegration/LinkListLink";

export const Footer = () => {
  return (
    <RhsFooter
      appearanceLevel={3}
      background="primary-filled"
      backtotop
      columns={[
        {
          appearanceLevel: 3,
          children: (
            <LinkList>
              <LinkListLink href="#" icon={<Icon icon="chevron-right" />}>
                Wat is MijnOverheid Zakelijk
              </LinkListLink>
              <LinkListLink href="#" icon={<Icon icon="chevron-right" />}>
                Toegankelijkheid
              </LinkListLink>
              <LinkListLink href="#" icon={<Icon icon="chevron-right" />}>
                Sitemap
              </LinkListLink>
              <LinkListLink href="#" icon={<Icon icon="chevron-right" />}>
                Vacatures
              </LinkListLink>
              <LinkListLink
                href="#"
                lang="en"
                icon={<Icon icon="chevron-right" />}
              >
                English
              </LinkListLink>
            </LinkList>
          ),
          heading: "Over deze site",
        },
        {
          appearanceLevel: 3,
          children: (
            <>
              <LinkList>
                <LinkListLink href="#" icon={<Icon icon="chevron-right" />}>
                  Veiligheid
                </LinkListLink>
                <LinkListLink href="#" icon={<Icon icon="chevron-right" />}>
                  Privacyverklaring
                </LinkListLink>
                <LinkListLink href="#" icon={<Icon icon="chevron-right" />}>
                  Wet- en regelgeving
                </LinkListLink>
                <LinkListLink href="#" icon={<Icon icon="chevron-right" />}>
                  Copyright
                </LinkListLink>
              </LinkList>
            </>
          ),
          heading: "Gegevensverwerking",
        },
        {
          appearanceLevel: 3,
          children: (
            <>
              <LinkList>
                <LinkListLink href="#" icon={<Icon icon="chevron-right" />}>
                  Mededelingen
                </LinkListLink>
                <LinkListLink href="#" icon={<Icon icon="chevron-right" />}>
                  Herken oplichting
                </LinkListLink>
                <LinkListLink href="#" icon={<Icon icon="chevron-right" />}>
                  Veelgestelde vragen
                </LinkListLink>
                <LinkListLink href="#" icon={<Icon icon="chevron-right" />}>
                  Contact
                </LinkListLink>
                <LinkListLink href="#" icon={<Icon icon="chevron-right" />}>
                  Klachtafhandeling
                </LinkListLink>
              </LinkList>
            </>
          ),
          heading: "Service",
        },
        {
          appearanceLevel: 3,
          children: (
            <>
              <LinkList>
                <LinkListLink href="#" icon={<Icon icon="chevron-right" />}>
                  Overheid.nl
                </LinkListLink>
                <LinkListLink href="#" icon={<Icon icon="chevron-right" />}>
                  Rijksoverheid.nl{" "}
                </LinkListLink>
                <LinkListLink href="#" icon={<Icon icon="chevron-right" />}>
                  Meldpunt Fouten in Overheidsregistraties{" "}
                </LinkListLink>
              </LinkList>
            </>
          ),
          heading: "Aangesloten organisaties",
        },
      ]}
      heading="Mijn Overheid Zakelijk"
      subFooter={
        <LinkList>
          <LinkListLink href="#">Privacy</LinkListLink>
        </LinkList>
      }
    />
  );
};
