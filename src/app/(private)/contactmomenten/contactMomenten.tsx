"use client";

import ContactMoment from "@/components/ContactMoment";
import CountdownBar from "@/components/CountdownBar";
import { Heading } from "@/components/rhc";
import { getContactMomenten } from "@/network/omc/fetchers/getContactMomenten";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";

const ContactmomentenPage = ({ kvk }: { kvk: string }) => {
  const queryClient = useQueryClient();
  const { isLoading, isError, data } = useQuery({
    queryKey: ["contactMomenten", kvk],
    queryFn: () => getContactMomenten(kvk),
    enabled: kvk != null,
  });
  const countdownRef = useRef<{ reset: () => void }>(null);

  if (isLoading) {
    <p>loading</p>;
  }
  if (isError) {
    <p>error</p>;
  }

  const handleCountdownEnd = () => {
    queryClient.invalidateQueries({ queryKey: ["contactMomenten"] });
    if (countdownRef.current) {
      countdownRef.current.reset();
    }
  };

  return (
    <>
      <Heading level={1}>Contactmomenten</Heading>
      <div className="mox-card">
        <CountdownBar onComplete={handleCountdownEnd} ref={countdownRef} />
        <div className="mox-timeline">
          {data?.Notificaties?.map((notificatie) => {
            return (
              <ContactMoment notificatie={notificatie} key={notificatie.id} />
            );
          })}
        </div>
      </div>
    </>
  );
};

export default ContactmomentenPage;
