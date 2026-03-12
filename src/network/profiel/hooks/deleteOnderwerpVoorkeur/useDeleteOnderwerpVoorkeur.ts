import { useMutation } from "@tanstack/react-query";
import { deleteOnderwerpVoorkeur } from "./action";
import { components } from "@/network/profiel/generated";

export const useDeleteOnderwerpVoorkeur = () =>
  useMutation({
    mutationFn: ({
      identificatieNummer,
      identificatieType,
      voorkeurId,
    }: {
      identificatieNummer: string;
      identificatieType: components["schemas"]["IdentificatieType"];
      voorkeurId: number;
    }) =>
      deleteOnderwerpVoorkeur(
        identificatieNummer,
        identificatieType,
        voorkeurId,
      ),
  });
