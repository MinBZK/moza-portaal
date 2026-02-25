import createClient from "openapi-fetch";
import type { paths } from "./generated";

const dopOpenDataClient = createClient<paths>({
  baseUrl: process.env.API_URL_DOP_OPEN_DATA,
});

export default dopOpenDataClient;
