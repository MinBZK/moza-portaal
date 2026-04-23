import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePostcodeVoorkeur } from "./action";

export const useDeletePostcodeVoorkeur = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number }) => deletePostcodeVoorkeur(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["actualiteiten", "voorkeuren"] });
    },
  });
};
