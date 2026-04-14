import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addPostcodeVoorkeur } from "./action";

export const useAddPostcodeVoorkeur = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      identificatieType,
      identificatieNummer,
      postcode,
    }: {
      identificatieType: string;
      identificatieNummer: string;
      postcode: string;
    }) => addPostcodeVoorkeur(identificatieType, identificatieNummer, postcode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["actualiteiten", "voorkeuren"] });
    },
  });
};
