import { useMutation } from "@tanstack/react-query";
import { updateEmail } from "./action";
import { components } from "@/network/profiel/generated";

export const useUpdateOndernemengContactvoorkeur = () =>
  useMutation({
    mutationFn: ({
      identificatieNummer,
      identificatieType,
      body,
    }: {
      identificatieNummer: string;
      identificatieType: components["schemas"]["IdentificatieType"];
      body: components["schemas"]["ContactgegevenUpdateRequest"];
    }) => updateEmail(identificatieNummer, identificatieType, body),
  });
