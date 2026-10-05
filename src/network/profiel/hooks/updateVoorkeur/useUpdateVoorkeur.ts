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
      scope,
    }: {
      identificatieNummer: string;
      identificatieType: components["schemas"]["IdentificatieType"];
      voorkeurType: components["schemas"]["VoorkeurType"];
      waarde: string;
      id?: string;
      scope?: components["schemas"]["ScopeRequest"];
    }) =>
      updateVoorkeur(
        identificatieNummer,
        identificatieType,
        voorkeurType,
        waarde,
        id,
        scope,
      ),
  });
