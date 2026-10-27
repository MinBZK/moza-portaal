"use client";

import { usePathname } from "next/navigation";
import {
  Button,
  Fieldset,
  FormFieldCheckboxOption,
  FormFieldTextInput,
} from "@rijkshuisstijl-community/components-react";
import {
  ASSISTENT_DEMO_EVENT,
  useAssistentInstellingen,
  zetAssistentInstelling,
  type AssistentDemo,
} from "./assistentInstellingen";
import Switch from "@/components/Switch";

const DEMO_KNOPPEN: [AssistentDemo, string][] = [
  ["testantwoord", "Testantwoord met bronvermelding tonen"],
  ["wallet", "Deelverzoek Business Wallet tonen"],
  ["eml", "Formulier maatregelenlijst tonen"],
  ["janee", "Formulier ja/nee-vraag tonen"],
];

/** Instellingen van de Digitale assistent in het Flags-paneel, zoals in moza-poc. */
const AssistentPaneel = ({
  backendIngesteld,
}: {
  /** Zonder backend staat de demo-modus standaard aan. */
  backendIngesteld: boolean;
}) => {
  const instellingen = useAssistentInstellingen();
  const opAssistent = usePathname() === "/digitale-assistent";
  const demo = instellingen.demoModus ?? !backendIngesteld;

  // De chat luistert naar dit event en toont het onderdeel.
  const toon = (soort: AssistentDemo) =>
    window.dispatchEvent(
      new CustomEvent(ASSISTENT_DEMO_EVENT, { detail: soort }),
    );

  return (
    <div>
      <Fieldset legend="Digitale assistent">
        <Switch
          label="LLM"
          twoWay
          offText="VLAM"
          onText="Claude"
          checked={instellingen.llm === "claude"}
          onChange={(claude) =>
            zetAssistentInstelling("llm", claude ? "claude" : "vlam")
          }
        />
        <Switch
          label="Transport"
          twoWay
          offText="MCP"
          onText="CLI"
          checked={instellingen.transport === "cli"}
          onChange={(cli) =>
            zetAssistentInstelling("transport", cli ? "cli" : "mcp")
          }
        />
        <FormFieldCheckboxOption
          label="Demo-modus: speel het draaiboek af zonder backend"
          description="Stel een voorbeeldvraag (energiebesparing, bedrijfsgegevens, belastingaangifte) en beantwoord de vragen. Typ “fout” voor de foutmelding."
          checked={demo}
          onChange={(event) =>
            zetAssistentInstelling("demoModus", event.target.checked)
          }
        />
        <FormFieldTextInput
          label="VLAM API-sleutel"
          type="password"
          placeholder="sk-..."
          value={instellingen.vlamSleutel}
          onChange={(event) =>
            zetAssistentInstelling(
              "vlamSleutel",
              (event.target as HTMLInputElement).value,
            )
          }
        />
        <FormFieldTextInput
          label="Claude API-sleutel"
          type="password"
          placeholder="sk-..."
          value={instellingen.claudeSleutel}
          onChange={(event) =>
            zetAssistentInstelling(
              "claudeSleutel",
              (event.target as HTMLInputElement).value,
            )
          }
        />
        <FormFieldTextInput
          label="KVK-nummer assistent"
          description="Leeg: het KVK-nummer van de persona."
          inputMode="numeric"
          placeholder="85234567"
          value={instellingen.testKvk}
          onChange={(event) =>
            zetAssistentInstelling(
              "testKvk",
              (event.target as HTMLInputElement).value,
            )
          }
        />
      </Fieldset>
      {opAssistent &&
        DEMO_KNOPPEN.map(([soort, label]) => (
          <Button
            key={soort}
            appearance="secondary-action-button"
            onClick={() => toon(soort)}
          >
            {label}
          </Button>
        ))}
    </div>
  );
};

export default AssistentPaneel;
