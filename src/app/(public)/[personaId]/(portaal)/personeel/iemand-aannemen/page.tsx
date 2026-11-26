"use client";

import { useEffect, useRef, useState } from "react";
import LoadingStatus from "@/components/LoadingStatus";
import { useRouter } from "next/navigation";
import { isIngediend, nieuweAanvraag, useAannemen } from "./_useAannemen";

/**
 * The entry of Iemand aannemen, from Personeel en rollen and the search
 * results. It begins at the voorbeeldberekening, or with `?naar=aanvragen`
 * (Regelingen aanvragen) directly at Kandidaat kiezen. After a submitted
 * request it starts a new, empty one. The cases in Lopende zaken stay.
 */
const IemandAannemenPage = () => {
  const router = useRouter();
  const { staat, werkBij } = useAannemen();
  const gestart = useRef(false);
  const [direct, setDirect] = useState(false);

  useEffect(() => {
    if (!staat || gestart.current) return;
    gestart.current = true;
    // Read here, not with useSearchParams: that needs a Suspense boundary.
    const naarAanvragen =
      new URLSearchParams(window.location.search).get("naar") === "aanvragen";
    setDirect(naarAanvragen);
    const nieuw = isIngediend(staat);
    if (nieuw) nieuweAanvraag();
    if (naarAanvragen) {
      // Zonder eerdere voorbeeldberekening geen voorbeeldbedragen.
      if (nieuw || staat.voorbeeldBerekend !== true)
        werkBij({ voorbeeldBerekend: false });
      router.replace("/personeel/iemand-aannemen/gegevens");
    } else router.replace("/personeel/iemand-aannemen/voorbeeldberekening");
  }, [staat, router, werkBij]);

  return (
    <LoadingStatus>
      {direct
        ? "Wij openen de aanvraag…"
        : "Wij openen de voorbeeldberekening…"}
    </LoadingStatus>
  );
};

export default IemandAannemenPage;
