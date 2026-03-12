import { useMutation } from "@tanstack/react-query";
import { addOnderwerpVoorkeur } from "./action";
import { components } from "@/network/profiel/generated";

export const useAddOnderwerpVoorkeur = () =>
  useMutation({
    mutationFn: ({
      identificatieNummer,
      identificatieType,
      onderwerp,
    }: {
      identificatieNummer: string;
      identificatieType: components["schemas"]["IdentificatieType"];
      onderwerp: string;
    }) =>
      addOnderwerpVoorkeur(identificatieNummer, identificatieType, onderwerp),
  });
