"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { isIngediend, useAannemen, wisAannemen } from "./_useAannemen";

/**
 * The entry of Iemand aannemen, from Personeel en rollen and the search
 * results. It begins at the voorbeeldberekening; after a submitted request
 * it starts a new, empty one.
 */
const IemandAannemenPage = () => {
  const router = useRouter();
  const { staat } = useAannemen();
  const gestart = useRef(false);

  useEffect(() => {
    if (!staat || gestart.current) return;
    gestart.current = true;
    if (isIngediend(staat)) wisAannemen();
    router.replace("/personeel/iemand-aannemen/voorbeeldberekening");
  }, [staat, router]);

  return null;
};

export default IemandAannemenPage;
