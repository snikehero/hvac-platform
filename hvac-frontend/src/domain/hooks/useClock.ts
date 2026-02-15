/* eslint-disable react-hooks/purity */
import { useState, useEffect } from "react";
export function useClock(interval = 1000) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      setNow(Date.now());
    }, interval);

    return () => clearInterval(id);
  }, [interval]);

  return now;
}
