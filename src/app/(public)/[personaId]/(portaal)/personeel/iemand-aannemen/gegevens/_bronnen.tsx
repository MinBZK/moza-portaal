"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ActionGroup,
  Button,
  Fieldset,
  FormFieldCheckboxOption,
  FormFieldRadio,
  Heading,
  Paragraph,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  UnorderedList,
  UnorderedListItem,
} from "@/components/rhc";
import type { DemoAannemen, DemoAannemenBron } from "@/demo";
import {
  BRONNEN,
  alleBronnenBevestigd,
  bronBevestigd,
  useAannemen,
  type BronId,
} from "../_useAannemen";
import { datumNL, type Werkgever } from "../_werkgever";

/**
 * Namens wie, de kandidaat kiezen, en het omgekeerde formulier: alles wat de
 * overheid al weet in een tabel, per bron een vinkje dat standaard aan staat.
 */
const Bronnen = ({
  bronnen,
  kandidaat,
  werkgever,
}: {
  bronnen: DemoAannemenBron[];
  kandidaat: DemoAannemen["kandidaat"];
  werkgever: Werkgever;
}) => {
  const router = useRouter();
  const { staat, werkBij } = useAannemen();
  const gekozen = !!staat && staat.kandidaat === kandidaat.bsnMasker;
  const aantal = staat
    ? BRONNEN.filter((id) => bronBevestigd(staat, id)).length
    : 0;
  const klaar = gekozen && !!staat && alleBronnenBevestigd(staat);
  const naam = `${kandidaat.voornaam} ${kandidaat.achternaam}`;

  const vink = (id: BronId, aan: boolean) =>
    werkBij({ bronnen: { ...(staat?.bronnen ?? {}), [id]: aan } });

  return (
    <>
      <section className="mox-card rhc-row-gap" aria-labelledby="namens">
        <Heading level={2} id="namens">
          Namens wie vult u in?
        </Heading>
        <Fieldset legend="Rol">
          <FormFieldRadio
            name="rol"
            value="eigenaar"
            label={`Ik ben eigenaar of vennoot van ${werkgever.onderneming}`}
            checked={(staat?.rol ?? "eigenaar") === "eigenaar"}
            onChange={() => werkBij({ rol: "eigenaar" })}
          />
          <FormFieldRadio
            name="rol"
            value="namens"
            label={`Ik vul in namens ${werkgever.onderneming}, bijvoorbeeld als salarisadministrateur`}
            checked={staat?.rol === "namens"}
            onChange={() => werkBij({ rol: "namens" })}
          />
        </Fieldset>
        {staat?.rol === "namens" && (
          <Paragraph className="mox-hiring-note">
            U kunt de aanvraag invullen. De eigenaar moet hem ondertekenen
            voordat hij wordt ingediend.
          </Paragraph>
        )}
      </section>

      <section className="mox-card rhc-row-gap" aria-labelledby="kandidaat">
        <Heading level={2} id="kandidaat">
          Wie wilt u aannemen?
        </Heading>
        <Paragraph>
          Gegevens over de kandidaat halen we alleen op met diens toestemming.
          De kandidaat geeft die via de eigen MijnOverheid; daarna staat de
          kandidaat hier.
        </Paragraph>
        <Fieldset legend="Kandidaten die u toestemming gaven">
          <FormFieldRadio
            name="kandidaat"
            value={kandidaat.bsnMasker}
            label={`${naam}, geboren ${datumNL(kandidaat.geboortedatum)}, toestemming gegeven op ${datumNL(kandidaat.toestemmingOp)}`}
            checked={gekozen}
            onChange={() => werkBij({ kandidaat: kandidaat.bsnMasker })}
          />
        </Fieldset>
        {gekozen && (
          <Paragraph className="mox-hiring-note">
            BSN {kandidaat.bsnMasker} gaat mee met de aanvraag en staat niet op
            het scherm.
          </Paragraph>
        )}
      </section>

      <Heading level={2}>Wat de overheid al weet</Heading>
      {!gekozen ? (
        <Paragraph>
          Kies eerst de kandidaat. Daarna halen we op wat de overheid al weet en
          ziet u het hier.
        </Paragraph>
      ) : (
        <>
          <Paragraph>
            Per bron staat aangevinkt dat de gegevens kloppen en gebruikt mogen
            worden. Klopt iets niet, haal het vinkje weg; die gegevens vult u
            dan zelf aan in de aanvraag.
          </Paragraph>
          <div className="mox-table-container">
            <Table className="mox-hiring-sources">
              <TableHeader>
                <TableRow>
                  <TableHeaderCell scope="col">Gegeven</TableHeaderCell>
                  <TableHeaderCell scope="col">Waarde</TableHeaderCell>
                </TableRow>
              </TableHeader>
              {bronnen.map((bron) => (
                <TableBody key={bron.id}>
                  <TableRow className="mox-hiring-sources__source">
                    <TableHeaderCell scope="rowgroup" id={`bron-${bron.id}`}>
                      {bron.organisatie}
                      <span className="mox-hiring-note">
                        {bron.register} · opgehaald op {datumNL(bron.opgehaald)}
                      </span>
                    </TableHeaderCell>
                    <TableCell>
                      <FormFieldCheckboxOption
                        label={
                          bron.id === "eigen"
                            ? "Klopt, gebruik mijn eigen opgave"
                            : `Klopt, gebruik deze gegevens`
                        }
                        name={`vinkje-${bron.id}`}
                        checked={!!staat && bronBevestigd(staat, bron.id)}
                        onChange={(event) =>
                          vink(bron.id, event.target.checked)
                        }
                      />
                    </TableCell>
                  </TableRow>
                  {bron.gegevens.map((g) => (
                    <TableRow key={g.parameter}>
                      <TableCell>{g.vraag}</TableCell>
                      <TableCell>{g.waarde}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              ))}
            </Table>
          </div>
          <details className="mox-hiring-legal-question">
            <summary>Zo vraagt de wet het</summary>
            <UnorderedList>
              {bronnen.flatMap((bron) =>
                bron.gegevens.map((g) => (
                  <UnorderedListItem key={`${bron.id}-${g.parameter}`}>
                    {bron.organisatie}: “{g.wetsvraag}” ({g.grond})
                  </UnorderedListItem>
                )),
              )}
            </UnorderedList>
          </details>
        </>
      )}

      <section className="mox-card rhc-row-gap">
        <Paragraph role="status">
          {!gekozen
            ? "Nog geen kandidaat gekozen."
            : klaar
              ? "Alle bronnen bevestigd. We kunnen de aanvraag voor u invullen."
              : `${aantal} van ${BRONNEN.length} bronnen bevestigd. Wat u niet bevestigt, vult u zelf aan in de aanvraag.`}
        </Paragraph>
        <ActionGroup>
          <Button
            appearance="primary-action-button"
            aria-disabled={!gekozen}
            onClick={() => {
              if (gekozen)
                router.push("/personeel/iemand-aannemen/concept-aanvraag");
            }}
          >
            Vul de aanvraag in
          </Button>
          <Link
            href="/personeel/iemand-aannemen"
            className="utrecht-link utrecht-link--html-a"
          >
            Terug naar de vragen
          </Link>
        </ActionGroup>
      </section>
    </>
  );
};

export default Bronnen;
