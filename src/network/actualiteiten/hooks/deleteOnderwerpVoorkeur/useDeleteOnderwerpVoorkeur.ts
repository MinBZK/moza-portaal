import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteOnderwerpVoorkeur } from "./action";

export const useDeleteOnderwerpVoorkeur = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      identificatieType,
      identificatieNummer,
      id,
    }: {
      identificatieType: string;
      identificatieNummer: string;
      id: number;
    }) => deleteOnderwerpVoorkeur(identificatieType, identificatieNummer, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["actualiteiten", "voorkeuren"] });
    },
  });
};
