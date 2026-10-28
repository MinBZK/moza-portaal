"use client";

import { Fragment, useEffect, useState } from "react";
import {
  ActionGroup,
  Alert,
  Button,
  Icon,
  Paragraph,
  Separator,
} from "@/components/rhc";
import { useQuery } from "@tanstack/react-query";
import { getKvkFromCookie } from "@/utils/kvknummer";
import { useGetVoorkeuren } from "@/network/actualiteiten/hooks/getVoorkeuren/useGetVoorkeuren";
import { getBerichten } from "@/network/actualiteiten/fetchers/getBerichten";
import PublicatieCard from "./_publicatieCard";

const PAGE_SIZE = 5;

const PublicatiesOverzicht = () => {
  const [kvkNummer, setKvkNummer] = useState<string | undefined | null>(null);
  useEffect(() => {
    getKvkFromCookie().then(setKvkNummer);
  }, []);

  const { data: voorkeuren, status: voorkeurenStatus } = useGetVoorkeuren();

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const postcodes = (voorkeuren?.postcodes ?? []).map((v) => v.postcode);

  const { data: publicaties = [], status: pubStatus } = useQuery({
    queryKey: ["actualiteiten", "berichten", postcodes],
    queryFn: () => getBerichten(),
    enabled: postcodes.length > 0,
  });

  if (kvkNummer == null || voorkeurenStatus === "pending") return null;

  const visible = publicaties.slice(0, visibleCount);

  return postcodes.length === 0 ? (
    <Paragraph>Voeg een postcode toe om publicaties te zien.</Paragraph>
  ) : pubStatus === "pending" ? (
    <Paragraph>Publicaties laden…</Paragraph>
  ) : pubStatus === "error" ? (
    <Alert type="error">
      Wij kunnen de berichten nu niet ophalen. Probeer het later opnieuw.
    </Alert>
  ) : publicaties.length === 0 ? (
    <Paragraph>
      Er zijn geen berichten voor uw postcodes. Voeg eventueel een andere
      postcode toe.
    </Paragraph>
  ) : (
    <>
      {visible.map((pub, index) => (
        <Fragment key={pub.preferredUrl}>
          {index > 0 && <Separator />}
          <PublicatieCard publicatie={pub} />
        </Fragment>
      ))}
      {visibleCount < publicaties.length && (
        <ActionGroup direction="row">
          <Button
            appearance="secondary-action-button"
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
          >
            Meer berichten laden
            <Icon icon="chevron-right" />
          </Button>
        </ActionGroup>
      )}
    </>
  );
};

export default PublicatiesOverzicht;
