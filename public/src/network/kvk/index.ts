import createClient from "openapi-fetch";
import type { paths } from "./generated";

const kvkClient = createClient<paths>({
  baseUrl: process.env.API_URL_KVK_MOCK,
});

export default kvkClient;
