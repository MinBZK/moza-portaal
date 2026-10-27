"use client";

import {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type Ref,
} from "react";
import ProgressBar from "@/components/ProgressBar";

export type CountdownBarHandle = { reset: () => void };

/** How often the bar updates. */
const TICK_MS = 100;

/**
 * Countdown as a ProgressBar that runs from full to empty, by default in 60
 * seconds. When the time is up it calls onComplete; the parent can start
 * again with ref.current.reset(), as on the page Contactmomenten.
 */
const CountdownBar = ({
  onComplete,
  seconds = 60,
  label = "Tijd tot de volgende update",
  ref,
}: {
  onComplete: () => void;
  /** Duration of one round. */
  seconds?: number;
  /** Accessible name of the bar. */
  label?: string;
  ref?: Ref<CountdownBarHandle>;
}) => {
  const [remainingMs, setRemainingMs] = useState(seconds * 1000);
  const [round, setRound] = useState(0);
  // The latest onComplete, without restarting the timer when it changes.
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useImperativeHandle(ref, () => ({
    reset: () => {
      setRemainingMs(seconds * 1000);
      setRound((n) => n + 1);
    },
  }));

  useEffect(() => {
    const end = Date.now() + seconds * 1000;
    const timer = setInterval(() => {
      const left = Math.max(0, end - Date.now());
      setRemainingMs(left);
      if (left === 0) {
        clearInterval(timer);
        onCompleteRef.current();
      }
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [seconds, round]);

  const remaining = Math.ceil(remainingMs / 1000);

  return (
    <ProgressBar
      label={label}
      value={remainingMs / 1000}
      max={seconds}
      valueText={`Nog ${remaining} ${remaining === 1 ? "seconde" : "seconden"}`}
    />
  );
};

export default CountdownBar;
