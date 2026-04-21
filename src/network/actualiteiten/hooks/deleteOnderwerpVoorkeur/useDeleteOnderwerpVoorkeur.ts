import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteOnderwerpVoorkeur } from "./action";

export const useDeleteOnderwerpVoorkeur = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number }) => deleteOnderwerpVoorkeur(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["actualiteiten", "voorkeuren"] });
    },
  });
};
