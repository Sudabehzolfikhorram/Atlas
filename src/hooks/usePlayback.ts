import { useCallback, useEffect, useRef, useState } from "react";

const TICK_MS = 1100;

interface Options {
  month: number;
  start: number;
  end: number;
  setMonth: (m: number) => void;
}

/** Instance-scoped monthly playback. Stays within [start, end], stops at the end, on hide and on unmount. */
export function usePlayback({ month, start, end, setMonth }: Options) {
  const [playing, setPlaying] = useState(false);
  const timer = useRef<number | null>(null);
  const monthRef = useRef(month);
  const setMonthRef = useRef(setMonth);
  monthRef.current = month;
  setMonthRef.current = setMonth;

  const stop = useCallback(() => {
    if (timer.current !== null) {
      window.clearInterval(timer.current);
      timer.current = null;
    }
    setPlaying(false);
  }, []);

  const play = useCallback(() => {
    if (timer.current !== null) return;
    let m = monthRef.current >= end ? start : Math.max(start, monthRef.current);
    setMonthRef.current(m);
    setPlaying(true);
    timer.current = window.setInterval(() => {
      m += 1;
      if (m > end) {
        stop();
        return;
      }
      setMonthRef.current(m);
      if (m >= end) stop();
    }, TICK_MS);
  }, [start, end, stop]);

  const toggle = useCallback(() => timer.current !== null ? stop() : play(), [play, stop]);

  // Period bounds changed — never keep playing outside the active window.
  useEffect(() => {
    stop();
  }, [start, end, stop]);

  useEffect(() => {
    const onVis = () => {
      if (document.hidden) stop();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      if (timer.current !== null) window.clearInterval(timer.current);
    };
  }, [stop]);

  return { playing, toggle, stop };
}