"use client";

import { useEffect, useRef } from "react";
import LoadingStatus from "@/components/LoadingStatus";
import { useRouter } from "next/navigation";
import { isIngediend, nieuweAanvraag, useAannemen } from "./_useAannemen";

/**
 * The entry of Iemand aannemen, from Personeel en rollen and the search
 * results. It begins at the voorbeeldberekening; after a submitted request
 * it starts a new, empty one. The cases in Lopende zaken stay.
 */
const IemandAannemenPage = () => {
  const router = useRouter();
  const { staat } = useAannemen();
  const gestart = useRef(false);

  useEffect(() => {
    if (!staat || gestart.current) return;
    gestart.current = true;
    if (isIngediend(staat)) nieuweAanvraag();
    router.replace("/personeel/iemand-aannemen/voorbeeldberekening");
  }, [staat, router]);

  return <LoadingStatus>Wij openen de voorbeeldberekening…</LoadingStatus>;
};

export default IemandAannemenPage;
