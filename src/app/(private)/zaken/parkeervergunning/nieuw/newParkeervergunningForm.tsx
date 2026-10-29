"use client";

import { Button, Heading } from "@/components/rhc";
import FormField from "@/components/form/formField";
import { useCreateParkeervergunning } from "@/network/mock/hooks/createParkeervergunning/useCreateParkeervergunning";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { z } from "zod";

const ParkeervergunningForm = ({ kvk }: { kvk: string }) => {
  const parkeervergunningSchema = z.object({
    bedrijfsKvk: z.string().min(1),
    kenteken: z.string().min(1),
    motivatie: z.string(),
    aanvragerEmail: z.string().email(),
  });

  // TODO: Replace with actual mutation hook for parkeervergunning
  const { mutate } = useCreateParkeervergunning();

  const router = useRouter();
  const form = useForm({
    defaultValues: {
      bedrijfsKvk: kvk,
      kenteken: "",
      motivatie: "",
      aanvragerEmail: "",
    },
    validators: {
      onSubmit: parkeervergunningSchema,
    },
    onSubmit: ({ value: values }) => {
      mutate({ body: values }, { onSuccess: () => router.push("/zaken") });
    },
  });

  return (
    <>
      <Heading level={1}>Nieuwe parkeervergunning aanvragen</Heading>
      <div className="rhc-mox-card">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <form.Field name="kenteken">
            {(field) => <FormField label={"Kenteken"} field={field} />}
          </form.Field>
          <form.Field name="motivatie">
            {(field) => <FormField label={"Motivatie"} field={field} />}
          </form.Field>
          <form.Field name="aanvragerEmail">
            {(field) => (
              <FormField
                label="E-mailadres"
                field={field}
                autoComplete="email"
              />
            )}
          </form.Field>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            <Button type="submit" appearance="primary-action-button">
              Versturen
            </Button>
          </form.Subscribe>
        </form>
      </div>
    </>
  );
};

export default ParkeervergunningForm;
