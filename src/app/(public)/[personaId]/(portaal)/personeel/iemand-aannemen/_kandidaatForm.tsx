"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import Link from "next/link";
import {
  ActionGroup,
  Button,
  Fieldset,
  FormFieldCheckboxOption,
  FormFieldTextInput,
  Paragraph,
} from "@/components/rhc";
import type { DemoAannemen } from "@/demo";
import { useAannemen } from "./_useAannemen";
import { datumNL, type Werkgever } from "./_werkgever";

/**
 * Alleen wat de overheid nog niet weet: wie, en wat is afgesproken. De
 * velden zijn voorgevuld met Koen; het prototype rekent met 32 uur.
 */
const KandidaatForm = ({
  kandidaat,
  dienstverband,
  werkgever,
}: {
  kandidaat: DemoAannemen["kandidaat"];
  dienstverband: DemoAannemen["dienstverband"];
  werkgever: Werkgever;
}) => {
  const router = useRouter();
  const { werkBij } = useAannemen();

  const verder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const uren = Number(new FormData(event.currentTarget).get("uren"));
    werkBij({
      uren: uren > 0 && uren <= 60 ? uren : dienstverband.urenPerWeek,
    });
    router.push("/personeel/iemand-aannemen/gegevens");
  };

  return (
    <form onSubmit={verder} className="rhc-row-gap">
      <Paragraph>
        Vul in wie u wilt aannemen en wat u heeft afgesproken. De rest haalt
        MijnOverheid Zakelijk op bij UWV, uw gemeente, de KVK en de
        Belastingdienst, met toestemming van de kandidaat.
      </Paragraph>

      <Fieldset legend="Kandidaat">
        <FormFieldTextInput
          label="Voornaam"
          name="voornaam"
          defaultValue={kandidaat.voornaam}
        />
        <FormFieldTextInput
          label="Achternaam"
          name="achternaam"
          defaultValue={kandidaat.achternaam}
        />
        <FormFieldTextInput
          label="Geboortedatum"
          name="geboortedatum"
          type="date"
          defaultValue={kandidaat.geboortedatum}
        />
        <FormFieldTextInput
          label="Burgerservicenummer (BSN)"
          name="bsn"
          inputMode="numeric"
          defaultValue={kandidaat.bsnMasker}
          description="Het BSN wordt alleen gebruikt om de gegevens bij UWV en de gemeente op te halen. Het staat nergens op het scherm."
        />
        <FormFieldCheckboxOption
          label={`${kandidaat.voornaam} heeft toestemming gegeven dat ${werkgever.onderneming} zijn gegevens bij UWV en de gemeente gebruikt voor deze aanvraag (gegeven op ${datumNL(kandidaat.toestemmingOp)})`}
          name="toestemming"
          defaultChecked
        />
      </Fieldset>

      <Fieldset legend="Dienstverband">
        <FormFieldTextInput
          label="Functie"
          name="functie"
          defaultValue={dienstverband.functie}
        />
        <FormFieldTextInput
          label="Uren per week"
          name="uren"
          type="number"
          inputMode="numeric"
          defaultValue={String(dienstverband.urenPerWeek)}
          description="De regelrecht-engine rekent in uw browser met dit aantal uren."
        />
        <FormFieldTextInput
          label="Eerste werkdag"
          name="aanvang"
          type="date"
          defaultValue={dienstverband.aanvang}
        />
        <FormFieldTextInput
          label="Loon"
          name="loon"
          defaultValue={dienstverband.uurloonLabel}
        />
      </Fieldset>

      <ActionGroup>
        <Button type="submit" appearance="primary-action-button">
          Haal de gegevens op
        </Button>
        <Link href="/personeel" className="utrecht-link utrecht-link--html-a">
          Annuleer
        </Link>
      </ActionGroup>
    </form>
  );
};

export default KandidaatForm;
