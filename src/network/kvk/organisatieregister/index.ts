import createClient from "openapi-fetch";
import type { paths } from "./generated";

const kvkOrganisatieRegisterClient = createClient<paths>({
  baseUrl: process.env.API_URL_KVK_MOCK,
});

export default kvkOrganisatieRegisterClient;
