import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePostcodeVoorkeur } from "./action";

export const useDeletePostcodeVoorkeur = () => {
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
    }) => deletePostcodeVoorkeur(identificatieType, identificatieNummer, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["actualiteiten", "voorkeuren"] });
    },
  });
};
