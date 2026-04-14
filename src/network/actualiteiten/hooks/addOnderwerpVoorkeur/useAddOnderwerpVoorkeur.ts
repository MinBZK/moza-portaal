import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addOnderwerpVoorkeur } from "./action";

export const useAddOnderwerpVoorkeur = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      identificatieType,
      identificatieNummer,
      onderwerp,
    }: {
      identificatieType: string;
      identificatieNummer: string;
      onderwerp: string;
    }) => addOnderwerpVoorkeur(identificatieType, identificatieNummer, onderwerp),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["actualiteiten", "voorkeuren"] });
    },
  });
};
