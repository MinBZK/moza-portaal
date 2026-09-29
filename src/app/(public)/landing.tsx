"use client";

import { signIn } from "next-auth/react";
import { useCookie } from "@/utils/useCookie";
import {
  PreHeading,
  Heading,
  Paragraph,
  LinkButton,
  Icon,
  RoundedCorner,
  UnorderedList,
  UnorderedListItem,
  DataSummary,
  DataSummaryItem,
  NavigationList,
  NavigationListItem,
} from "@rijkshuisstijl-community/components-react";

const PublicPage = () => {
  const { set } = useCookie("loginMethod");

  return (
    <div className="utrecht-page-body">
      <div className="mox-landing-hero">
        <div className="mox-landing-hero-text">
          <PreHeading
            heading={<Heading level={1}>MijnOverheid Zakelijk</Heading>}
          >
            Pre-heading
          </PreHeading>
          <Paragraph>Makkelijk zakendoen met de overheid</Paragraph>
          <button
            onClick={() => {
              set("digid");
              signIn(undefined, { callbackUrl: "/" });
            }}
            className="mox-login-digid"
          >
            <svg viewBox="0 0 150 150" width={40} height={40}>
              <path
                xmlns="http://www.w3.org/2000/svg"
                d="M136 150H14c-8 0-14-6-14-14V14C0 6 6 0 14 0h122c8 0 14 6 14 14v122c0 8-6 14-14 14z"
              />
              <path
                xmlns="http://www.w3.org/2000/svg"
                d="M17 115V79h10c12 0 19 6 19 17 0 13-8 19-19 19H17zm6-6h4c7 0 12-4 12-13 0-8-5-12-13-12h-3v25zm31-32c3 0 4 1 4 3s-1 4-4 4c-2 0-3-2-3-4s1-3 3-3zm3 38h-6V88h6v27zm15-6h6c6 0 9 3 9 7 0 5-4 9-14 9-8 0-11-2-11-7 0-2 1-4 4-6l-2-3c0-2 1-3 3-4-3-2-4-4-4-8 0-6 4-10 11-10l4 1h9v4h-4l2 5c0 6-4 9-12 9h-3l-1 1c0 2 1 2 3 2zm1 12c6 0 8-2 8-4s-1-2-3-2l-9-1-2 3c0 2 2 4 6 4zm6-24c0-3-2-5-5-5s-5 1-5 5 1 5 5 5c3 0 5-1 5-5z"
                fill="#fff"
              />
              <path
                xmlns="http://www.w3.org/2000/svg"
                d="M94 77c2 0 3 1 3 3s-1 4-3 4c-3 0-4-2-4-4s1-3 4-3zm3 38h-6V88h6v27zm8 0V79h10c12 0 18 6 18 17 0 13-7 19-19 19h-9zm6-6h4c7 0 12-4 12-13 0-8-5-12-13-12h-3v25z"
                fill="#e17000"
              />
            </svg>
            <p>Inloggen met DigiD</p>
          </button>
          <button
            onClick={() => {
              set("eherkenning");
              signIn(undefined, { callbackUrl: "/" });
            }}
            className="mox-login-eherkenning"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              aria-hidden="true"
              viewBox="0 0 64 64"
            >
              <path fill="transparent" d="M0 0h64v64H0z" />
              <path
                fill="#e2066e"
                d="M34.706 48h5.305V33.927h-5.305zM34.706 28.826h5.305V16h-5.305zM54.87 16v12.852H43.069l-2.266 5.033H54.87V48h5.29V16z"
              />
              <path
                fill="#053775"
                d="M12.525 48c-4.799-.001-8.683-3.835-8.685-8.569V24.583c.002-4.732 3.886-8.566 8.685-8.568h16.84v5.328h-16.84c-1.813.002-3.283 1.453-3.283 3.24V39.43c0 1.79 1.47 3.237 3.283 3.24h16.84V48h-16.84Z"
              />
              <path
                fill="#053775"
                d="M13.237 28.83v5.059h12.626l2.331-5.059z"
              />
            </svg>
            <p>Inloggen met E-Herkenning</p>
          </button>
          <LinkButton>
            Bekijk alle inlogmogelijkheden
            <Icon icon="chevron-right" />
          </LinkButton>
        </div>
        <RoundedCorner
          alt="Nature"
          as="img"
          position="start-end"
          src="/bg-full-zakelijk-cropped.webp"
        />
      </div>
      <div className="mox-landing-info">
        <div>
          <Heading level={2}>Berichtenbox</Heading>
          <Paragraph>
            De Berichtenbox is uw zakelijke digitale brievenbus voor post van de
            overheid. Bijvoorbeeld post over:
          </Paragraph>
          <UnorderedList>
            <UnorderedListItem>Belastingaangifte</UnorderedListItem>
            <UnorderedListItem>Vergunningen</UnorderedListItem>
            <UnorderedListItem>Subsidies</UnorderedListItem>
          </UnorderedList>
        </div>
        <div>
          <Heading level={2}>Uw bedrijfsgegevens</Heading>
          <Paragraph>
            Hier ziet u welke gegevens de overheid over uw bedrijf heeft.
            Bijvoorbeeld gegevens over:
          </Paragraph>
          <UnorderedList>
            <UnorderedListItem>Uw inschrijving bij de KVK</UnorderedListItem>
            <UnorderedListItem>Btw en loonheffingen</UnorderedListItem>
            <UnorderedListItem>Uw vestigingen</UnorderedListItem>
          </UnorderedList>
        </div>
      </div>

      <Heading level={2} className="mox-landing-quicklinks-heading">
        Snel naar
      </Heading>
      <div className="mox-landing-quicklinks">
        <div>
          <NavigationList className="mox-navigation-list--no-start-icon">
            <NavigationListItem
              description="Lorem ipsum dolor sit amet, consectetur adipiscing elit"
              href="#"
              icon=""
              label="Lorem ipsum"
            />
            <NavigationListItem
              description="Pellentesque at lobortis erat, in egestas turpis"
              href="#"
              icon=""
              label="Quisque pharetra"
            />
            <NavigationListItem
              description="Proin imperdiet, tellus eu condimentum cursus"
              href="#"
              icon=""
              label="Integer porttitor massa"
            />
          </NavigationList>
        </div>
        <div>
          <NavigationList className="mox-navigation-list--no-start-icon">
            <NavigationListItem
              description="Lorem ipsum dolor sit amet, consectetur adipiscing elit"
              href="#"
              icon=""
              label="Phasellus sodales interdum"
            />
            <NavigationListItem
              description="Ut tincidunt fringilla tortor, ut venenatis erat"
              href="#"
              icon=""
              label="Etiam egestas"
            />
            <NavigationListItem
              description="Nullam eget risus eu odio ultrices commodo"
              href="#"
              icon=""
              label="Quisque tempor egestas"
            />
          </NavigationList>
        </div>
      </div>

      <div className="mox-landing-demo-info">
        <Heading level={2}>
          Dit is een demo-prototype van MijnOverheid Zakelijk
        </Heading>
        <section>
          <Paragraph>
            Dit is een versie bedoeld om ideeën en functionaliteiten te testen.
            De inhoud en werking zijn in ontwikkeling aan wijziging onderheven.
          </Paragraph>
          <Paragraph>
            Let op: dit prototype bevat <strong>géén</strong> echte DigiD en
            E-Herkenning koppeling. Vul hier geen persoonlijke gegevens in.
          </Paragraph>
          <Paragraph>U kunt inloggen met de volgende testgegevens:</Paragraph>
          <DataSummary>
            <DataSummaryItem
              itemKey="Gebruikersnaam"
              itemValue="gebruiker1, gebruiker2 of gebruiker3, bedrijf"
            />
            <DataSummaryItem itemKey="Wachtwoord" itemValue="password" />
          </DataSummary>
          <Paragraph>
            Gebruiker 1 heeft een onderneming met bsn 000000036.
          </Paragraph>
          <Paragraph>
            Gebruiker 2 heeft twee ondernemingen met bsn 000000024.
          </Paragraph>
          <Paragraph>
            Gebruiker 3 heeft drie onderneming met bsn 000000012.
          </Paragraph>
          <Paragraph>
            Bedrijf is een mock van eHerkenning voor een enkele onderneming.
          </Paragraph>
        </section>
        <section>
          <Heading level={3}>
            Wilt u meer weten over MijnOverheid Zakelijk?
          </Heading>
          <Paragraph>
            Ga naar{" "}
            <a href="https://www.mijnoverheidzakelijk.nl/">
              mijnoverheidzakelijk.nl
            </a>{" "}
            voor meer informatie.
          </Paragraph>
        </section>
      </div>
    </div>
  );
};

export default PublicPage;
