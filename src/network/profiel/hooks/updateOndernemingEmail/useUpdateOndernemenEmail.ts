import { useMutation } from "@tanstack/react-query";
import {
  updateEmail,
  verifyEmail,
  requestVerificationCode,
  type ContactgegevenBody,
} from "./action";
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
      body: ContactgegevenBody;
    }) => updateEmail(identificatieNummer, identificatieType, body),
  });

// Should also have a verification for telefoonummer in future
export const useVerifyEmail = () =>
  useMutation({
    mutationFn: ({
      body,
    }: {
      body: components["schemas"]["EmailVerificatieRequest"];
    }) => verifyEmail(body),
  });

export const useRequestVerificationCode = () =>
  useMutation({
    mutationFn: ({
      body,
    }: {
      body: components["schemas"]["EmailVerificatieCodeAanvraagRequest"];
    }) => requestVerificationCode(body),
  });
