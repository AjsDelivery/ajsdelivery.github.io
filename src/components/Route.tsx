/**
 * La route entre l'enlèvement et la livraison, jalonnée de bornes kilométriques.
 * C'est l'élément visuel signature du site.
 */
interface Props {
  depart: string;
  arrivee: string;
  km: number | null;
  minutes?: number | null;
  chargement?: boolean;
}

export default function Route({ depart, arrivee, km, minutes, chargement }: Props) {
  const bornes = km ? Math.min(14, Math.max(4, Math.round(km / 8))) : 8;
  return (
    <div aria-hidden={false}>
      <div className="flex items-end justify-between gap-3 text-[0.85rem] font-semibold">
        <span className="min-w-0 truncate">{depart}</span>
        <span className="min-w-0 truncate text-right">{arrivee}</span>
      </div>
      <div className="relative mt-2 h-9" role="img" aria-label={km ? `${Math.round(km)} kilomètres` : "Distance en calcul"}>
        {/* la route */}
        <div className="absolute inset-x-2 top-1/2 h-[10px] -translate-y-1/2 rounded-full bg-encre" />
        <div
          className={`absolute inset-x-2 top-1/2 h-[2px] -translate-y-1/2 ${chargement ? "animate-pulse" : ""}`}
          style={{ backgroundImage: "repeating-linear-gradient(90deg,#FF7A00 0 10px,transparent 10px 18px)" }}
        />
        {/* bornes kilométriques */}
        <div className="absolute inset-x-6 top-0 flex h-full justify-between">
          {Array.from({ length: bornes }).map((_, i) => (
            <span key={i} className="mt-[3px] block h-[7px] w-[2px] bg-gris-clair" />
          ))}
        </div>
        {/* départ / arrivée */}
        <span className="absolute left-0 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-[3px] border-encre bg-orange" />
        <span className="absolute right-0 top-1/2 h-5 w-5 -translate-y-1/2 rounded-[4px] border-[3px] border-encre bg-papier" />
        {/* la borne centrale avec les km */}
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-md border-2 border-encre bg-papier px-2 py-0.5 font-display text-[1rem] font-bold leading-tight chiffres">
          {chargement ? "…" : km ? `${Math.round(km)} km` : "— km"}
        </span>
      </div>
      {minutes ? <p className="mt-1 text-center text-[0.8rem] text-gris">environ {minutes} min de route</p> : null}
    </div>
  );
}

export function IconeWhatsApp({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.22 8.22 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.13-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.29Z" />
    </svg>
  );
}
