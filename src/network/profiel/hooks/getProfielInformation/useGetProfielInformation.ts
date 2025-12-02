import { useQuery } from "@tanstack/react-query";
import { getProfielInformation } from "./action";

export function useGetProfielInformation(
  identificatieType: "KVK" | "BSN",
  identificatieNummer: string,
) {
  return useQuery({
    queryKey: ["profiel", identificatieType, identificatieNummer],
    queryFn: () =>
      getProfielInformation({ identificatieType, identificatieNummer }),
    enabled: !!identificatieNummer,
  });
}
