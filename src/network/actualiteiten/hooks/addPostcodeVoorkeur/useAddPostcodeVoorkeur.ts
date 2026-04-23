import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addPostcodeVoorkeur } from "./action";

export const useAddPostcodeVoorkeur = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postcode }: { postcode: string }) =>
      addPostcodeVoorkeur(postcode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["actualiteiten", "voorkeuren"] });
    },
  });
};
