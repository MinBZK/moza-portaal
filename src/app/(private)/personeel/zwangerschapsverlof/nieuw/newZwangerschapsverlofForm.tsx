"use client";

import { Button, FormFieldTextInput, Heading } from "@/components/rhc";
import FormField, { FieldInfo } from "@/components/form/formField";
import { useCreateZwangerschapsverlof } from "@/network/mock/hooks/createZwangerschapsverlof/useCreateZwangerschapsverlof";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { z } from "zod";

/** Datum uit het datumveld (jjjj-mm-dd) als UTC ISO-string. Leeg blijft leeg. */
const naarUtc = (datum: string) =>
  datum ? new Date(`${datum}T00:00:00Z`).toISOString() : "";

/** ISO-string terug naar de waarde voor het datumveld. */
const datumWaarde = (waarde: string) =>
  waarde ? new Date(waarde).toISOString().split("T")[0] : "";

const NewZwangerschapsverlofForm = ({ kvk }: { kvk: string }) => {
  const zwangerschapsverlofSchema = z.object({
    bsn: z.string().min(1),
    naam: z.string().min(1),
    startDatum: z.string().min(1),
    eindDatum: z.string().min(1),
    bedrijfsKvk: z.string().min(1),
    opmerking: z.string().min(1),
  });

  const { mutate } = useCreateZwangerschapsverlof();

  const router = useRouter();
  const form = useForm({
    defaultValues: {
      bedrijfsKvk: kvk,
      bsn: "",
      naam: "",
      startDatum: "",
      eindDatum: "",
      opmerking: "",
    },
    validators: {
      onSubmit: zwangerschapsverlofSchema,
    },
    onSubmit: ({ value: values }) => {
      mutate(
        { body: values },
        {
          onSuccess: () => {
            router.push("/personeel");
          },
        },
      );
    },
  });

  return (
    <>
      <Heading level={1}>Nieuw zwangerschapsverlof melden</Heading>
      <div className="mox-card">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <form.Field name="bsn">
            {(field) => <FormField label={"BSN"} field={field} />}
          </form.Field>
          <form.Field name="naam">
            {(field) => <FormField label={"Naam"} field={field} />}
          </form.Field>
          <form.Field name="startDatum">
            {(field) => (
              <>
                <FormFieldTextInput
                  name={field.name}
                  label="Begindatum"
                  type="date"
                  value={datumWaarde(field.state.value)}
                  onBlur={field.handleBlur}
                  // Het event komt van de input, maar is getypt op de wrapper-div.
                  onChange={(e) =>
                    field.handleChange(
                      naarUtc((e.target as HTMLInputElement).value),
                    )
                  }
                />
                <FieldInfo field={field} />
              </>
            )}
          </form.Field>
          <form.Field name="eindDatum">
            {(field) => (
              <>
                <FormFieldTextInput
                  name={field.name}
                  label="Einddatum"
                  type="date"
                  value={datumWaarde(field.state.value)}
                  onBlur={field.handleBlur}
                  // Het event komt van de input, maar is getypt op de wrapper-div.
                  onChange={(e) =>
                    field.handleChange(
                      naarUtc((e.target as HTMLInputElement).value),
                    )
                  }
                />
                <FieldInfo field={field} />
              </>
            )}
          </form.Field>
          <form.Field name="opmerking">
            {(field) => <FormField label={"Opmerking"} field={field} />}
          </form.Field>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            <Button type="submit" appearance="primary-action-button">
              Opslaan
            </Button>
          </form.Subscribe>
        </form>
      </div>
    </>
  );
};

export default NewZwangerschapsverlofForm;
