import { useMutation } from "@tanstack/react-query";
import { updateEmail, verifyEmail } from "./action";
import { components } from "@/network/profiel/generated";

export const useUpdateOndernemengContactvoorkeur = () =>
  useMutation({
    mutationFn: ({
      identificatieNummer,
      identificatieType,
      body,
    }: {
      identificatieNummer: string;
      identificatieType: components["schemas"]["IdentificatieType"];
      body: components["schemas"]["ContactgegevenUpdateRequest"];
    }) => updateEmail(identificatieNummer, identificatieType, body),
  });

// Should also have a verification for telefoonummer in future
export const useVerifyEmail = () =>
  useMutation({
    mutationFn: ({
      email,
      verificatiecode,
    }: {
      email: string;
      verificatiecode: string;
    }) => verifyEmail(email, verificatiecode),
  });
