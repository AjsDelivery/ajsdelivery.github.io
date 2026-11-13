/**
 * Briques de motion design, sans librairie :
 *  - <Reveal> : dévoile un bloc une seule fois quand il entre à l'écran
 *  - <CountUp> : fait défiler un nombre (prix, km) comme un compteur
 *  - <VanAJS> : la camionnette du logo AJS, en silhouette
 *  - <BandeOrange> : la bande orange qui défile, comme dans la vidéo
 * Tout s'arrête si l'appareil demande de réduire les animations.
 */
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { VAN_TRACE, VAN_VIEWBOX } from "./vanTrace";

export const reduireAnimations = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export function Reveal({
  children,
  className = "",
  delai = 0,
  as: Tag = "div",
  style,
}: {
  children: ReactNode;
  className?: string;
  delai?: number;
  as?: "div" | "section" | "li" | "article";
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLElement>(null);
  const [vu, setVu] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduireAnimations() || !("IntersectionObserver" in window)) {
      setVu(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVu(true);
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag ref={ref as any} className={`reveal ${vu ? "reveal-vu" : ""} ${className}`} style={{ transitionDelay: `${delai}ms`, ...style }}>
      {children}
    </Tag>
  );
}

/** Fait défiler un nombre de l'ancienne à la nouvelle valeur */
export function CountUp({ valeur, format, duree = 700 }: { valeur: number; format: (n: number) => string; duree?: number }) {
  const [affiche, setAffiche] = useState(valeur);
  const depart = useRef(valeur);
  useEffect(() => {
    if (reduireAnimations()) {
      setAffiche(valeur);
      depart.current = valeur;
      return;
    }
    const de = depart.current;
    const t0 = performance.now();
    let raf = 0;
    const pas = (t: number) => {
      const p = Math.min(1, (t - t0) / duree);
      const e = 1 - Math.pow(1 - p, 3);
      setAffiche(de + (valeur - de) * e);
      if (p < 1) raf = requestAnimationFrame(pas);
      else depart.current = valeur;
    };
    raf = requestAnimationFrame(pas);
    return () => {
      cancelAnimationFrame(raf);
      depart.current = valeur;
    };
  }, [valeur, duree]);
  return <>{format(affiche)}</>;
}

/** Camionnette du logo AJS (silhouette pleine) */
export function VanAJS({ className = "", couleur = "currentColor" }: { className?: string; couleur?: string }) {
  return (
    <svg viewBox={VAN_VIEWBOX} className={className} aria-hidden>
      <path fill={couleur} fillRule="evenodd" d={VAN_TRACE} />
    </svg>
  );
}

/**
 * Bande orange : les engagements défilent en grand,
 * le même mot passe en filigrane dans l'autre sens.
 */
export function BandeOrange({ messages, filigrane }: { messages: string[]; filigrane: string }) {
  const suite = [...messages, ...messages];
  const fond = Array.from({ length: 8 }, () => filigrane);
  return (
    <div className="relative overflow-hidden bg-orange py-7 text-encre sm:py-9" aria-hidden>
      <div className="defile-inverse pointer-events-none absolute inset-y-0 flex w-max items-center gap-8 whitespace-nowrap opacity-[0.13]" aria-hidden>
        {[...fond, ...fond].map((m, i) => (
          <span key={i} className="titre text-[6.5rem] sm:text-[8rem]">
            {m}
          </span>
        ))}
      </div>
      <div className="defile relative flex w-max items-center gap-10 whitespace-nowrap" aria-hidden>
        {suite.map((m, i) => (
          <span key={i} className="flex items-center gap-10">
            <span className="titre text-[2.2rem] sm:text-[3.2rem]">{m}</span>
            <VanAJS className="h-6 w-auto sm:h-8" />
          </span>
        ))}
      </div>
    </div>
  );
}
