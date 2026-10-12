import createClient from "openapi-fetch";
import type { paths } from "./generated";

const profielClient = createClient<paths>({
  // Standaard de test-profielservice die moza-poc ook gebruikt.
  baseUrl:
    process.env.API_URL_PROFIEL_SERVICE ||
    "https://profiel.mijnoverheidzakelijk.nl",
});

export default profielClient;
