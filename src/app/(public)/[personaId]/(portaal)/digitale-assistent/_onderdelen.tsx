"use client";

import { useState, type FormEvent } from "react";
import {
  ActionGroup,
  Button,
  Fieldset,
  FormFieldCheckboxOption,
  FormFieldErrorMessage,
  FormFieldRadio,
  FormFieldTextInput,
  Heading,
  Link,
  Paragraph,
  VisuallyHidden,
} from "@rijkshuisstijl-community/components-react";
import { Icon } from "@rijkshuisstijl-community/icon-react";
import { Markdown } from "./_markdown";
import {
  BRONNEN,
  RADIO_WAARDE,
  REGELPARAMETER,
  bronURL,
  getal,
  maakBron,
  vandaag,
} from "./_logica";
import type {
  Antwoorden,
  Bron,
  Item,
  ServerStatus,
  WalletData,
} from "./_types";

type ItemVan<S extends Item["soort"]> = Extract<Item, { soort: S }>;

/** Bronvermelding onder een antwoord, met de datum van raadpleging. */
export const Bronnen = ({ bronnen }: { bronnen?: Bron[] }) => {
  if (!bronnen?.length) return null;
  return (
    <div className="rhc-chat-sources">
      <Paragraph>{bronnen.length === 1 ? "Bron:" : "Bronnen:"}</Paragraph>
      <ul>
        {bronnen.map((bron) => {
          const tekst = bron.titel
            ? `${bron.label}: ${bron.titel}`
            : bron.label;
          const url = bron.url || bronURL(bron.label);
          return (
            <li key={tekst}>
              {url ? (
                <Link href={url} target="_blank" rel="external noopener">
                  {tekst}
                </Link>
              ) : (
                <span>{tekst}</span>
              )}
              <small>Geraadpleegd op {bron.geraadpleegdOp ?? vandaag()}</small>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const Vervolg = ({ vervolg }: { vervolg?: { label: string; href: string } }) =>
  vervolg ? (
    <ActionGroup>
      <a
        href={vervolg.href}
        className="utrecht-button-link utrecht-button-link--html-a utrecht-button-link--primary-action"
      >
        {vervolg.label}
      </a>
    </ActionGroup>
  ) : null;

export const Gebruiker = ({ item }: { item: ItemVan<"gebruiker"> }) => (
  <div className="rhc-chat-message rhc-chat-message--user">
    <VisuallyHidden>U: </VisuallyHidden>
    <Paragraph>{item.tekst}</Paragraph>
  </div>
);

export const Assistent = ({ item }: { item: ItemVan<"assistent"> }) => (
  <div className="rhc-chat-message rhc-chat-message--assistant">
    <VisuallyHidden>Assistent: </VisuallyHidden>
    <Markdown tekst={item.tekst} />
    <Bronnen bronnen={item.bronnen} />
    <Vervolg vervolg={item.vervolg} />
  </div>
);

export const Fout = ({ item }: { item: ItemVan<"fout"> }) => (
  <div className="rhc-chat-message rhc-chat-message--error" role="alert">
    <Icon icon="let-op" />
    <div>
      <Paragraph>{item.tekst}</Paragraph>
      <Vervolg vervolg={item.vervolg} />
    </div>
  </div>
);

export const VOORBEELDVRAGEN = [
  "Geldt de energiebesparingsinformatieplicht voor mij?",
  "Hoe kan ik mijn bedrijfsgegevens bekijken?",
  "Hoe bereid ik mijn belastingaangifte voor?",
];

export const Suggesties = ({
  item,
  onVraag,
  onUitleg,
}: {
  item: ItemVan<"suggesties">;
  onVraag: (vraag: string) => void;
  onUitleg: () => void;
}) => (
  <div className="rhc-chat-suggestions">
    <Paragraph>
      Stel uw vraag, of probeer een van deze voorbeeldvragen:
    </Paragraph>
    {VOORBEELDVRAGEN.map((vraag) => (
      <Button
        key={vraag}
        appearance="secondary-action-button"
        onClick={() => onVraag(vraag)}
      >
        {vraag}
      </Button>
    ))}
    {item.opnieuw && (
      <Button appearance="subtle-button" onClick={onUitleg}>
        Uitleg opnieuw tonen
      </Button>
    )}
  </div>
);

/** Wachtindicatie terwijl de assistent "denkt". */
export const Denkt = ({ tekst }: { tekst: string }) => (
  <div className="rhc-chat-message rhc-chat-message--assistant rhc-chat-thinking">
    <span className="rhc-wait" aria-hidden="true" />
    <Paragraph>
      {tekst || <VisuallyHidden>Even geduld</VisuallyHidden>}
    </Paragraph>
  </div>
);

const Cijfer = ({
  label,
  waarde,
  eenheid,
  grens,
}: {
  label: string;
  waarde: number;
  eenheid: string;
  grens: number | null;
}) => {
  const boven = grens !== null && waarde > grens;
  return (
    <div>
      <dt>{label}</dt>
      <dd>
        <span className="rhc-energy-value">
          {getal(waarde)} {eenheid}
        </span>
        {grens !== null && (
          <span
            className={
              boven
                ? "rhc-energy-threshold rhc-energy-threshold--above"
                : "rhc-energy-threshold rhc-energy-threshold--below"
            }
          >
            {boven ? "boven" : "onder"} de grens van {getal(grens)} {eenheid}
          </span>
        )}
      </dd>
    </div>
  );
};

/** Energieverbruik uit de Business Wallet, met de grens uit RegelRecht. */
export const EnergieKaart = ({
  id,
  data,
  uitgever,
  drempel,
}: {
  id: string;
  data: WalletData;
  uitgever: string;
  drempel: { kwh: number; gas: number } | null;
}) => {
  const totaal = data.verbruik?.totaal ?? {};
  const peiljaar = data.credential?.peiljaar;
  return (
    <div className="rhc-chat-energy">
      <Heading level={3} id={`${id}-energie`} tabIndex={-1}>
        Energieverbruik (uit uw Business Wallet)
      </Heading>
      <Paragraph>
        Afgegeven door: {uitgever}
        {peiljaar ? ` · peiljaar ${peiljaar}` : ""}
      </Paragraph>
      {data.toestemming?.met_toestemming_ondernemer && (
        <Paragraph className="rhc-chat-badge">
          <Icon icon="circle-check" />
          Geverifieerd, met toestemming gedeeld
        </Paragraph>
      )}
      <dl className="rhc-energy-figures">
        <Cijfer
          label="Elektriciteit"
          waarde={Number(totaal.jaarlijks_elektriciteitsverbruik_kwh ?? 0)}
          eenheid="kWh"
          grens={drempel?.kwh ?? null}
        />
        <Cijfer
          label="Gas"
          waarde={Number(totaal.jaarlijks_gasverbruik_m3 ?? 0)}
          eenheid="m³"
          grens={drempel?.gas ?? null}
        />
      </dl>
      <Bronnen
        bronnen={[
          {
            label: "Business Wallet",
            titel: `Energieverbruik-attestatie, afgegeven door ${uitgever}`,
          },
        ]}
      />
    </div>
  );
};

/** Vraagt toestemming voordat de assistent een bron raadpleegt. */
export const Deelverzoek = ({
  item,
  drempel,
  onDelen,
  onNietDelen,
}: {
  item: ItemVan<"deelverzoek">;
  drempel: { kwh: number; gas: number } | null;
  onDelen: () => void;
  onNietDelen: () => void;
}) => (
  <section
    className="rhc-chat-card"
    data-kaart={item.id}
    aria-labelledby={`${item.id}-kop`}
  >
    {item.staat === "open" && (
      <>
        <Heading level={3} id={`${item.id}-kop`} tabIndex={-1}>
          Deelverzoek uit {item.bron}
        </Heading>
        <Paragraph id={`${item.id}-uitleg`}>{item.omschrijving}</Paragraph>
        <ActionGroup>
          <Button
            appearance="primary-action-button"
            aria-describedby={`${item.id}-kop ${item.id}-uitleg`}
            onClick={onDelen}
          >
            Delen
          </Button>
          <Button appearance="secondary-action-button" onClick={onNietDelen}>
            Niet delen
          </Button>
        </ActionGroup>
      </>
    )}
    {item.staat === "gedeeld" &&
      (item.energie ? (
        <EnergieKaart
          id={item.id}
          data={item.energie.data}
          uitgever={item.energie.uitgever}
          drempel={drempel}
        />
      ) : (
        <Paragraph id={`${item.id}-kop`}>
          Toestemming gegeven voor {item.bron}.
        </Paragraph>
      ))}
    {item.staat === "geweigerd" && (
      <Paragraph id={`${item.id}-kop`}>
        {item.energie
          ? "U hebt uw energieverbruik niet gedeeld. De assistent kan de informatieplicht dan niet automatisch met uw Business Wallet-gegevens controleren."
          : `U hebt geen toestemming gegeven voor ${item.bron}. De assistent raadpleegt deze bron niet.`}
      </Paragraph>
    )}
  </section>
);

const ONDERDELEN = "::onderdelen";

/** Formulier voor een vraag van de assistent met een gestructureerd antwoord. */
export const VraagKaart = ({
  item,
  bezig,
  onVerstuur,
  onUitleg,
}: {
  item: ItemVan<"vraag">;
  bezig: boolean;
  onVerstuur: (
    bericht: string,
    opgaven: Record<string, unknown> | null,
    antwoorden: Antwoorden,
  ) => void;
  onUitleg: (bericht: string) => void;
}) => {
  const { spec } = item;
  const verstuurd = item.staat === "verstuurd";
  const [antwoorden, setAntwoorden] = useState<Antwoorden>(
    () =>
      item.antwoorden ??
      Object.fromEntries(
        spec.velden.filter((v) => v.waarde).map((v) => [v.naam, v.waarde!]),
      ),
  );
  const [ontbreekt, setOntbreekt] = useState(false);
  const zet = (naam: string, waarde: string | string[]) =>
    setAntwoorden((huidig) => ({ ...huidig, [naam]: waarde }));
  const lijst = (naam: string) => {
    const waarde = antwoorden[naam];
    return Array.isArray(waarde) ? waarde : [];
  };

  const verstuur = (event: FormEvent) => {
    event.preventDefault();
    if (bezig || verstuurd) return;
    const delen: string[] = [];
    const opgaven: Record<string, unknown> = {};
    let mist = false;
    for (const veld of spec.velden) {
      if (veld.type === "categorieen") {
        const gekozen = lijst(veld.naam);
        if (!gekozen.length) {
          mist = true;
          continue;
        }
        delen.push(`Aanwezig: ${gekozen.join(", ")}`);
        if (REGELPARAMETER.test(veld.naam)) opgaven[veld.naam] = gekozen;
        continue;
      }
      const waarde = String(antwoorden[veld.naam] ?? "").trim();
      if (!waarde) {
        mist = true;
        continue;
      }
      const sleutel = veld.label.match(/^([A-Z]{1,4}\d+)/)?.[1] ?? veld.label;
      delen.push(`${sleutel}: ${waarde}`);
      const feit =
        veld.type === "radio"
          ? Object.hasOwn(RADIO_WAARDE, waarde)
            ? RADIO_WAARDE[waarde]
            : null
          : waarde;
      if (feit !== null && REGELPARAMETER.test(veld.naam))
        opgaven[veld.naam] = feit;
    }
    setOntbreekt(mist);
    if (mist) return;
    onVerstuur(
      `Mijn antwoorden: ${delen.join("; ")}.`,
      Object.keys(opgaven).length ? opgaven : null,
      antwoorden,
    );
  };

  const uitleg = () => {
    const vragen = spec.velden.map((v) => v.label).filter(Boolean);
    let bericht = `Leg mij dit uit: “${spec.titel}”`;
    if (vragen.length)
      bericht += `. Het gaat om deze vragen: ${vragen.join(" / ")}`;
    onUitleg(bericht);
  };

  const id = item.id;
  return (
    <section
      className="rhc-chat-card"
      data-kaart={id}
      aria-labelledby={`${id}-kop`}
    >
      <Heading level={3} id={`${id}-kop`} tabIndex={-1}>
        {spec.titel}
      </Heading>
      {(spec.intro || spec.tekst) && (
        <div id={`${id}-intro`}>
          {spec.intro && <Paragraph>{spec.intro}</Paragraph>}
          {spec.tekst && <Paragraph>{spec.tekst}</Paragraph>}
        </div>
      )}
      <form className="rhc-chat-form" onSubmit={verstuur} noValidate>
        {spec.velden.map((veld, index) => {
          const naam = `${id}-${index}`;
          if (veld.type === "categorieen") {
            const onderdelen = lijst(veld.naam + ONDERDELEN);
            return (
              <Fieldset key={veld.naam} legend={veld.label}>
                <Paragraph>
                  Kies eerst welke delen bij uw bedrijf voorkomen.
                </Paragraph>
                {(veld.groepen ?? []).map((groep) => (
                  <FormFieldCheckboxOption
                    key={groep.onderdeel}
                    label={groep.onderdeel}
                    disabled={verstuurd}
                    checked={onderdelen.includes(groep.onderdeel)}
                    onChange={(event) => {
                      const aan = event.target.checked;
                      zet(
                        veld.naam + ONDERDELEN,
                        aan
                          ? [...onderdelen, groep.onderdeel]
                          : onderdelen.filter((o) => o !== groep.onderdeel),
                      );
                      // Uitvinken haalt de categorieën eronder ook weg.
                      if (!aan)
                        zet(
                          veld.naam,
                          lijst(veld.naam).filter(
                            (c) => !(groep.opties ?? []).includes(c),
                          ),
                        );
                    }}
                  />
                ))}
                {(veld.groepen ?? [])
                  .filter((groep) => onderdelen.includes(groep.onderdeel))
                  .map((groep) => (
                    <Fieldset
                      key={groep.onderdeel}
                      legend={`${groep.onderdeel} — wat is hiervan aanwezig?`}
                    >
                      {(groep.opties ?? []).map((categorie) => (
                        <FormFieldCheckboxOption
                          key={categorie}
                          label={categorie}
                          disabled={verstuurd}
                          checked={lijst(veld.naam).includes(categorie)}
                          onChange={(event) =>
                            zet(
                              veld.naam,
                              event.target.checked
                                ? [...lijst(veld.naam), categorie]
                                : lijst(veld.naam).filter(
                                    (c) => c !== categorie,
                                  ),
                            )
                          }
                        />
                      ))}
                    </Fieldset>
                  ))}
              </Fieldset>
            );
          }
          if (veld.type === "radio" && veld.opties?.length) {
            return (
              <Fieldset key={veld.naam} legend={veld.label}>
                {veld.toelichting && <Paragraph>{veld.toelichting}</Paragraph>}
                {veld.opties.map((optie) => (
                  <FormFieldRadio
                    key={optie}
                    name={naam}
                    value={optie}
                    label={optie}
                    disabled={verstuurd}
                    checked={antwoorden[veld.naam] === optie}
                    onChange={() => zet(veld.naam, optie)}
                  />
                ))}
              </Fieldset>
            );
          }
          return (
            <FormFieldTextInput
              key={veld.naam}
              id={naam}
              name={naam}
              label={veld.label}
              disabled={verstuurd}
              value={String(antwoorden[veld.naam] ?? "")}
              onChange={(event) =>
                zet(veld.naam, (event.target as HTMLInputElement).value)
              }
            />
          );
        })}
        {ontbreekt && (
          <FormFieldErrorMessage>
            Beantwoord elke vraag voordat u verstuurt.
          </FormFieldErrorMessage>
        )}
        {verstuurd ? (
          <Paragraph className="rhc-chat-badge">
            <Icon icon="circle-check" />
            Antwoord verstuurd
          </Paragraph>
        ) : (
          <ActionGroup>
            <Button appearance="primary-action-button" type="submit">
              Antwoord versturen
            </Button>
            <Button appearance="secondary-action-button" onClick={uitleg}>
              Uitleg vragen
            </Button>
          </ActionGroup>
        )}
      </form>
      {spec.bron && <Bronnen bronnen={[maakBron(spec.bron)]} />}
    </section>
  );
};

/** Welke bronnen de assistent nu kan bereiken, met uitleg per bron. */
export const BronStatus = ({
  status,
  transport,
}: {
  /** null = de backend is niet bereikbaar. */
  status: ServerStatus | null;
  transport: "mcp" | "cli";
}) => {
  const [uit, setUit] = useState(false);
  const bronnen = status
    ? ((transport === "cli" ? status.cli : status.servers) ?? {})
    : null;
  // Een bron die niet in /health staat, bestaat niet in deze omgeving: die
  // hoort niet als storing in de lijst.
  const items = BRONNEN.filter((b) => !bronnen || bronnen[b.key] !== undefined);
  return (
    <div
      className={`prototype-chat-status${uit ? " prototype-chat-status--off" : ""}`}
      onKeyDown={(event) => event.key === "Escape" && setUit(true)}
      onPointerMove={() => setUit(false)}
      onFocus={() => setUit(false)}
    >
      <Paragraph>Status van bronnen:</Paragraph>
      <ul>
        {items.map((bron) => {
          const verbonden = bronnen?.[bron.key] === "verbonden";
          return (
            <li
              key={bron.key}
              className={
                verbonden ? "prototype-chat-status--connected" : undefined
              }
            >
              <Icon icon={verbonden ? "circle-check" : "alert-circle"} />
              <span
                className="prototype-chat-status-source"
                tabIndex={0}
                aria-describedby={`bron-uitleg-${bron.key}`}
              >
                {bron.label}
              </span>
              <span
                className="prototype-chat-status-explanation"
                role="tooltip"
                id={`bron-uitleg-${bron.key}`}
              >
                {bron.uitleg}{" "}
                {verbonden
                  ? "Nu bereikbaar."
                  : "Nu niet bereikbaar. De assistent kan deze bron op dit moment niet gebruiken."}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
