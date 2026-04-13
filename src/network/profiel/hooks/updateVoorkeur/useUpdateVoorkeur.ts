import { useMutation } from "@tanstack/react-query";
import { updateVoorkeur } from "./action";
import { components } from "@/network/profiel/generated";

export const useUpdateVoorkeur = () =>
  useMutation({
    mutationFn: ({
      identificatieNummer,
      identificatieType,
      voorkeurType,
      waarde,
      id,
    }: {
      identificatieNummer: string;
      identificatieType: components["schemas"]["IdentificatieType"];
      voorkeurType: components["schemas"]["VoorkeurType"];
      waarde: string;
      id?: number;
    }) =>
      updateVoorkeur(
        identificatieNummer,
        identificatieType,
        voorkeurType,
        waarde,
        id,
      ),
  });
