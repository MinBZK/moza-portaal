import createClient from "openapi-fetch";
import type { paths } from "./generated";

const kvkBasisprofielClient = createClient<paths>({
  baseUrl: process.env.API_URL_KVK_BASISPROFIEL,
});

export default kvkBasisprofielClient;
