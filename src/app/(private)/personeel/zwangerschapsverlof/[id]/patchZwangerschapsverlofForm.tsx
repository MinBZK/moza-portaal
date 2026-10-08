"use client";

import { Button, Heading } from "@/components/rhc";
import FormField from "@/components/form/formField";
import { useUpdateZwangerschapsverlof } from "@/network/mock/hooks/updateZwangerschapsverlof/useUpdateZwangerschapsverlof";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { z } from "zod";

const PatchZwangerschapsverlofForm = ({ zaakId }: { zaakId: string }) => {
  const zwangerschapsverlofSchema = z.object({
    opmerking: z.string().min(1),
  });

  const { mutate } = useUpdateZwangerschapsverlof();

  const router = useRouter();
  const form = useForm({
    defaultValues: {
      opmerking: "",
    },
    validators: {
      onSubmit: zwangerschapsverlofSchema,
    },
    onSubmit: ({ value: values }) => {
      mutate(
        { body: values, id: zaakId },
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
      <Heading level={1}>
        Opmerking aan zwangerschapsverlofaanvraag toevoegen
      </Heading>
      <div className="mox-card">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
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

export default PatchZwangerschapsverlofForm;
