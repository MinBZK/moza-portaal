"use server";
import { components } from "@/network/kvk/organisatieregister/generated";
import { cookies } from "next/headers";

export async function getKvkFromCookie() {
  return (await cookies()).get("kvk")?.value;
}

export async function getKvkOptionsFromCookie(): Promise<
  components["schemas"]["MijnOverheidOrganisatiesResponse"]
> {
  return await JSON.parse((await cookies()).get("kvkOpties")?.value ?? "{}");
}

export async function updateKvkCookie(newKvk: string) {
  (await cookies()).set({
    name: "kvk",
    value: newKvk,
    httpOnly: true,
    secure: true,
    path: "/",
  });
}

export async function setOptionCookies(
  kvkOpties: components["schemas"]["MijnOverheidOrganisatiesResponse"],
) {
  (await cookies()).set({
    name: "kvkOpties",
    value: JSON.stringify(kvkOpties),
    httpOnly: true,
    secure: true,
    path: "/",
  });
}
