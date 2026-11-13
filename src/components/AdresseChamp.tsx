import { useEffect, useId, useRef, useState } from "react";
import { Crosshair, Loader2, MapPin, Search } from "lucide-react";
import { adresseDepuisPosition, lienMaps, maPosition, rechercherAdresses, volOiseau, type Lieu } from "../lib/geo";

interface Props {
  label: string;
  valeur: Lieu | null;
  onChange: (l: Lieu | null) => void;
  /** Point de référence pour trier les résultats et afficher les km */
  reference?: { lat: number; lon: number } | null;
  avecPosition?: boolean;
  placeholder?: string;
}

export default function AdresseChamp({ label, valeur, onChange, reference, avecPosition, placeholder }: Props) {
  const id = useId();
  const [q, setQ] = useState("");
  const [resultats, setResultats] = useState<Lieu[]>([]);
  const [ouvert, setOuvert] = useState(false);
  const [charge, setCharge] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [localisation, setLocalisation] = useState(false);
  const [actif, setActif] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (q.trim().length < 3) {
      setResultats([]);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setCharge(true);
      setErreur(null);
      try {
        const r = await rechercherAdresses(q, reference ?? undefined, ctrl.signal);
        setResultats(r);
        setOuvert(true);
        setActif(-1);
      } catch {
        if (!ctrl.signal.aborted) setErreur("La recherche d'adresse ne répond pas. Réessayez dans un instant.");
      } finally {
        if (!ctrl.signal.aborted) setCharge(false);
      }
    }, 280);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q, reference]);

  async function utiliserPosition() {
    setErreur(null);
    setLocalisation(true);
    try {
      const pos = await maPosition();
      const lieu = await adresseDepuisPosition(pos.coords.latitude, pos.coords.longitude);
      onChange({ ...lieu, precision: Math.round(pos.coords.accuracy) });
    } catch (e) {
      const code = (e as GeolocationPositionError)?.code;
      setErreur(
        code === 1
          ? "La localisation est refusée. Autorisez-la dans les réglages du navigateur, ou tapez l'adresse."
          : "Position introuvable pour le moment. Tapez l'adresse à la place.",
      );
    } finally {
      setLocalisation(false);
    }
  }

  function choisir(l: Lieu) {
    onChange(l);
    setQ("");
    setResultats([]);
    setOuvert(false);
  }

  if (valeur) {
    return (
      <div>
        <p className="mb-1 text-[0.85rem] font-semibold text-brume">{label}</p>
        <div className="flex items-start gap-3 rounded-lg border border-orange/50 bg-nuit px-3 py-2.5">
          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-orange" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="font-semibold leading-snug">{valeur.label}</p>
            <p className="text-[0.85rem] text-brume">
              {valeur.precision ? `Précision ± ${valeur.precision} m. ` : ""}
              <a className="lien" href={lienMaps(valeur)} target="_blank" rel="noreferrer">
                Vérifier sur la carte
              </a>
            </p>
          </div>
          <button
            type="button"
            className="text-[0.9rem] font-semibold lien shrink-0"
            onClick={() => {
              onChange(null);
              setTimeout(() => inputRef.current?.focus(), 0);
            }}
          >
            Modifier
          </button>
        </div>
      </div>
    );
  }

  const listeId = `${id}-liste`;
  return (
    <div className="relative">
      <label htmlFor={id} className="mb-1 block text-[0.85rem] font-semibold text-brume">
        {label}
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-brume" aria-hidden />
        <input
          ref={inputRef}
          id={id}
          className="champ pl-10 pr-10"
          placeholder={placeholder ?? "Rue, numéro, ville"}
          autoComplete="off"
          role="combobox"
          aria-expanded={ouvert && resultats.length > 0}
          aria-controls={listeId}
          aria-autocomplete="list"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => resultats.length && setOuvert(true)}
          onBlur={() => setTimeout(() => setOuvert(false), 150)}
          onKeyDown={(e) => {
            if (!ouvert || !resultats.length) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActif((a) => Math.min(resultats.length - 1, a + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActif((a) => Math.max(0, a - 1));
            } else if (e.key === "Enter" && actif >= 0) {
              e.preventDefault();
              choisir(resultats[actif]);
            } else if (e.key === "Escape") setOuvert(false);
          }}
        />
        {charge && <Loader2 className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-brume" aria-label="Recherche…" />}
      </div>

      {ouvert && resultats.length > 0 && (
        <ul id={listeId} role="listbox" className="absolute z-30 mt-1 w-full overflow-hidden rounded-lg border border-filet bg-bitume shadow-2xl">
          {resultats.map((r, i) => (
            <li key={r.label + i} role="option" aria-selected={i === actif}>
              <button
                type="button"
                className={`flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-filet ${i === actif ? "bg-filet" : ""} ${
                  i ? "border-t border-filet" : ""
                }`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choisir(r)}
              >
                <MapPin className="h-4 w-4 shrink-0 text-orange" aria-hidden />
                <span className="min-w-0 flex-1 leading-snug">{r.label}</span>
                {reference && (
                  <span className="chiffres shrink-0 font-mono text-[0.8rem] text-brume">≈ {Math.round(volOiseau(reference, r) * 1.3)} km</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {avecPosition && (
        <button type="button" className="btn btn-sombre mt-2 w-full !text-[0.95rem]" onClick={utiliserPosition} disabled={localisation}>
          {localisation ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <Crosshair className="h-5 w-5" aria-hidden />}
          {localisation ? "Localisation en cours…" : "Utiliser ma position"}
        </button>
      )}
      {erreur && (
        <p role="alert" className="mt-2 text-[0.9rem] font-medium text-orange-vif">
          {erreur}
        </p>
      )}
    </div>
  );
}
