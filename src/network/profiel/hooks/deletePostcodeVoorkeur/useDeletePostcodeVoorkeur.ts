import { useMutation } from "@tanstack/react-query";
import { deletePostcodeVoorkeur } from "./action";
import { components } from "@/network/profiel/generated";

export const useDeletePostcodeVoorkeur = () =>
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
      deletePostcodeVoorkeur(
        identificatieNummer,
        identificatieType,
        voorkeurId,
      ),
  });
