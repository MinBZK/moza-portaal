import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addOnderwerpVoorkeur } from "./action";

export const useAddOnderwerpVoorkeur = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ onderwerp }: { onderwerp: string }) =>
      addOnderwerpVoorkeur(onderwerp),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["actualiteiten", "voorkeuren"] });
    },
  });
};
