import { getKvkFromCookie } from "@/utils/kvknummer";
import Bedrijfsprofiel from "@/app/(private)/bedrijfsgegevens/bedrijfsgegevens";

const IdentiteitPage = async () => {
  const kvk = await getKvkFromCookie();

  if (!kvk) {
    return <p>Something went wrong..</p>;
  }

  return <Bedrijfsprofiel kvk={kvk} />;
};

export default IdentiteitPage;
