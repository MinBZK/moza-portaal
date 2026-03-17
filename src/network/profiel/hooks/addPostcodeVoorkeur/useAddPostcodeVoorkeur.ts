import { useMutation } from "@tanstack/react-query";
import { addPostcodeVoorkeur } from "./action";
import { components } from "@/network/profiel/generated";

export const useAddPostcodeVoorkeur = () =>
  useMutation({
    mutationFn: ({
      identificatieNummer,
      identificatieType,
      postcode,
    }: {
      identificatieNummer: string;
      identificatieType: components["schemas"]["IdentificatieType"];
      postcode: string;
    }) =>
      addPostcodeVoorkeur(identificatieNummer, identificatieType, postcode),
  });
