"use client";

import { Button, Heading } from "@/components/rhc";
import FormField, { FieldInfo } from "@/components/form/formField";
import {
  FormFieldSelect,
  FormFieldTextarea,
  SelectOption,
} from "@rijkshuisstijl-community/components-react/no-side-effects";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useCreateSubsidie } from "@/network/mock/hooks/createSubsidie/useCreateSubsidie";

const NewSubsidieForm = ({ kvk }: { kvk: string }) => {
  const subsidieSchema = z.object({
    bedrijfsKvk: z.string().min(1),
    subtype: z.string().min(1),
    motivatie: z.string(),
    aanvragerEmail: z.string().email(),
  });

  // TODO: Replace with actual mutation hook for subsidie aanvraag
  const { mutate } = useCreateSubsidie();
  const router = useRouter();
  const form = useForm({
    defaultValues: {
      bedrijfsKvk: kvk,
      subtype: "",
      motivatie: "",
      aanvragerEmail: "",
    },
    validators: {
      onSubmit: subsidieSchema,
    },
    onSubmit: ({ value: values }) => {
      mutate({ body: values }, { onSuccess: () => router.push("/zaken") });
    },
  });

  return (
    <>
      <Heading level={1}>Nieuwe subsidie aanvragen</Heading>
      <div className="mox-card">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <form.Field name="subtype">
            {(field) => (
              <>
                <FormFieldSelect
                  name={field.name}
                  label="Subsidie type"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                >
                  <SelectOption value=""></SelectOption>
                  <SelectOption value="Warmtepomp">Warmtepomp</SelectOption>
                  <SelectOption value="Zonnepanelen">Zonnepanelen</SelectOption>
                  <SelectOption value="HR++ Glas">HR++ Glas</SelectOption>
                </FormFieldSelect>
                <FieldInfo field={field} />
              </>
            )}
          </form.Field>
          <form.Field name="aanvragerEmail">
            {(field) => <FormField label={"E-mail"} field={field} />}
          </form.Field>
          <form.Field name="motivatie">
            {(field) => (
              <>
                <FormFieldTextarea
                  name={field.name}
                  label="Motivatie"
                  rows={4}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
                <FieldInfo field={field} />
              </>
            )}
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

export default NewSubsidieForm;
