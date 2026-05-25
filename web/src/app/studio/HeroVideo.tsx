"use client";

import { useEffect, useRef, useState } from "react";

const FADE_DURATION_MS = 1000;

/**
 * Seamless looping hero background — two stacked <video> elements cross-fade
 * into each other near the loop point so the seam is invisible.
 * Adapted from the RIVAI landing (route: /) crossfade.
 */
export default function HeroVideo({ src }: { src: string }) {
  const [active, setActive] = useState(0);
  const ref0 = useRef<HTMLVideoElement>(null);
  const ref1 = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v0 = ref0.current;
    const v1 = ref1.current;
    if (!v0 || !v1) return;

    const onTimeUpdate = () => {
      const cur = active === 0 ? v0 : v1;
      const next = active === 0 ? v1 : v0;
      if (
        cur.duration > 0 &&
        cur.currentTime > cur.duration - FADE_DURATION_MS / 1000
      ) {
        if (next.paused) {
          next.currentTime = 0;
          next.play().catch(() => {});
          setActive(active === 0 ? 1 : 0);
        }
      }
    };

    v0.addEventListener("timeupdate", onTimeUpdate);
    v1.addEventListener("timeupdate", onTimeUpdate);
    v0.play().catch(() => {});

    return () => {
      v0.removeEventListener("timeupdate", onTimeUpdate);
      v1.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, [active]);

  return (
    <>
      <video
        ref={ref0}
        muted
        playsInline
        aria-hidden
        style={{ opacity: active === 0 ? 0.5 : 0 }}
      >
        <source src={src} type="video/mp4" />
      </video>
      <video
        ref={ref1}
        muted
        playsInline
        aria-hidden
        style={{ opacity: active === 1 ? 0.5 : 0 }}
      >
        <source src={src} type="video/mp4" />
      </video>
    </>
  );
}
