"use client";
import Card from "@/components/card";
import { components } from "@/network/profiel/generated";
import { getOndernemingByDate } from "@/network/profiel/hooks/getOndernemingProfielByDate/action";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";

const ProfielHistoryPicker = ({ kvkNummer }: { kvkNummer: string }) => {
  const form = useForm({
    defaultValues: {
      date: "",
    },
    onSubmit: async ({ value: values }) => {
      const dateObj = new Date(values.date + "T10:00:00Z"); //api verwacht hele timestamp in utc
      const datetime = dateObj.toISOString().replace(/\.\d{3}Z$/, "Z");

      const { data, status } = await getOndernemingByDate({
        kvkNummer,
        datetime,
      });

      if (status == 200) {
        setProfiel(data?.Onderneming ?? {});
      } else {
        console.log(status);
      }
    },
  });

  const [profiel, setProfiel] =
    useState<components["schemas"]["Onderneming"]>();

  return (
    <Card className="space-y-4">
      <h2 className="text-2xl">Wat was mijn profiel in het verleden</h2>
      <p>
        Let op, we laten het profiel zien zoals het wat op de geselecteerde
        datum om 12:00 in de middag
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-2"
      >
        <form.Field name="date">
          {(field) => (
            <div className="flex flex-col gap-1">
              <label htmlFor={field.name}>Datum</label>
              <input
                id={field.name}
                type="date"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                className="w-100 rounded border px-2 py-1"
              />
            </div>
          )}
        </form.Field>
        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Bekijk profiel
        </button>
      </form>

      {profiel && (
        <pre className="overflow-x-auto rounded bg-gray-100 p-4 text-sm">
          {JSON.stringify(profiel, null, 4)}
        </pre>
      )}
    </Card>
  );
};

export default ProfielHistoryPicker;
