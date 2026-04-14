import createClient from "openapi-fetch";
import type { paths } from "./generated";

const actualiteitenClient = createClient<paths>({
  baseUrl: process.env.API_URL_ACTUALITEITEN_SERVICE,
});

export default actualiteitenClient;
