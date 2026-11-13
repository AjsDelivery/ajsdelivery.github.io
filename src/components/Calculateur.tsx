import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Info, MessageSquareText, Package, Phone, Sofa, Truck, Zap } from "lucide-react";
import { ENTREPRISE } from "../config/entreprise";
import { TARIFS } from "../config/tarifs";
import { calculerDevis, euros, type Acces, type ServiceId } from "../lib/devis";
import { calculerItineraire, type Itineraire, type Lieu } from "../lib/geo";
import { construireMessage, lienAppel, lienSMS, lienWhatsApp, nouvelleRef, NOMS_SERVICES, type Demande } from "../lib/message";
import AdresseChamp from "./AdresseChamp";
import Route, { IconeWhatsApp } from "./Route";
import { CountUp } from "./Motion";

const SERVICES: { id: ServiceId; icone: typeof Truck; aide: string }[] = [
  { id: "demenagement", icone: Sofa, aide: "Meubles, cartons, électroménager" },
  { id: "express", icone: Zap, aide: "Colis urgent, départ rapide" },
  { id: "marchandises", icone: Package, aide: "Palettes, matériel, stock" },
  { id: "chauffeur", icone: Truck, aide: "À l'heure, vous dirigez, on conduit" },
];

type Option = { id: string; label: string; detail: string };

function optionsDe(service: ServiceId): Option[] {
  const s = TARIFS.services;
  if (service === "express") return [...s.express.tailles];
  if (service === "marchandises") return [...s.marchandises.chargements];
  if (service === "demenagement") return [...s.demenagement.volumes];
  return [];
}

function prochainsJours(n: number): Date[] {
  const maintenant = new Date();
  const debut = new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate());
  if (maintenant.getHours() >= 18) debut.setDate(debut.getDate() + 1);
  return Array.from({ length: n }, (_, i) => new Date(debut.getFullYear(), debut.getMonth(), debut.getDate() + i));
}

function nomJour(d: Date): string {
  const auj = new Date();
  const demain = new Date(auj.getFullYear(), auj.getMonth(), auj.getDate() + 1);
  if (d.toDateString() === auj.toDateString()) return "Aujourd'hui";
  if (d.toDateString() === demain.toDateString()) return "Demain";
  return new Intl.DateTimeFormat("fr-BE", { weekday: "short", day: "numeric" }).format(d);
}

const ACCES_RDC: Acces = { etage: 0, ascenseur: false };

export default function Calculateur({ onPrix }: { onPrix?: (ttc: number | null) => void }) {
  const [service, setService] = useState<ServiceId | null>(null);
  const [depart, setDepart] = useState<Lieu | null>(null);
  const [arrivee, setArrivee] = useState<Lieu | null>(null);
  const [options, setOptions] = useState<Record<string, string>>({});
  const [accesDepart, setAccesDepart] = useState<Acces>(ACCES_RDC);
  const [accesArrivee, setAccesArrivee] = useState<Acces>(ACCES_RDC);
  const [immediat, setImmediat] = useState(true);
  const [deuxiemePersonne, setDeuxiemePersonne] = useState(false);
  const [heures, setHeures] = useState<number>(TARIFS.services.chauffeur.minimumHeures);
  const [date, setDate] = useState<Date | null>(null);
  const [creneau, setCreneau] = useState<string | null>(null);
  const [nom, setNom] = useState("");
  const [note, setNote] = useState("");
  const [itin, setItin] = useState<Itineraire | null>(null);
  const [calcul, setCalcul] = useState(false);
  const [detail, setDetail] = useState(false);
  const [ref] = useState(() => nouvelleRef());
  const jours = useMemo(() => prochainsJours(10), []);
  const autreDateRef = useRef<HTMLInputElement>(null);

  const opts = service ? optionsDe(service) : [];
  const optionId = service ? options[service] ?? opts[0]?.id : undefined;
  const optionChoisie = opts.find((o) => o.id === optionId);
  const avecEtages = service === "demenagement" || service === "marchandises";
  const planifie = service !== "express" || !immediat;

  // Les boutons « Calculer ce prix » de la page pré-sélectionnent le service
  useEffect(() => {
    const choisir = (e: Event) => {
      const id = (e as CustomEvent<ServiceId>).detail;
      if (id) setService(id);
    };
    window.addEventListener("ajs:service", choisir);
    return () => window.removeEventListener("ajs:service", choisir);
  }, []);

  // Itinéraire réel dès que les deux adresses sont connues
  useEffect(() => {
    if (!depart || !arrivee) {
      setItin(null);
      return;
    }
    const ctrl = new AbortController();
    setCalcul(true);
    calculerItineraire(ENTREPRISE.depot, depart, arrivee, ctrl.signal)
      .then((r) => setItin(r))
      .catch(() => {})
      .finally(() => !ctrl.signal.aborted && setCalcul(false));
    return () => ctrl.abort();
  }, [depart, arrivee]);

  const devis = useMemo(() => {
    if (!service || !itin) return null;
    return calculerDevis({
      service,
      kmApproche: itin.kmApproche,
      kmTrajet: itin.kmTrajet,
      option: optionId,
      depart: accesDepart,
      arrivee: accesArrivee,
      immediat: service === "express" && immediat,
      deuxiemePersonne,
      heures,
      date: planifie ? date : null,
    });
  }, [service, itin, optionId, accesDepart, accesArrivee, immediat, deuxiemePersonne, heures, date, planifie]);

  useEffect(() => {
    onPrix?.(devis && !devis.surDevis ? devis.totalTTC : null);
  }, [devis, onPrix]);

  const manque: string[] = [];
  if (!service) manque.push("le service");
  if (!depart) manque.push("l'adresse d'enlèvement");
  if (!arrivee) manque.push("l'adresse de livraison");
  if (planifie && !date) manque.push("le jour");
  if (planifie && !creneau) manque.push("le créneau");
  const pret = manque.length === 0 && !!devis && !calcul;

  const message = useMemo(() => {
    if (!pret || !service || !depart || !arrivee || !devis) return "";
    const d: Demande = {
      ref,
      service,
      optionLabel: optionChoisie ? `${optionChoisie.label} (${optionChoisie.detail})` : undefined,
      depart,
      arrivee,
      accesDepart,
      accesArrivee,
      immediat: service === "express" && immediat,
      deuxiemePersonne: service === "marchandises" && deuxiemePersonne,
      heures: service === "chauffeur" ? heures : undefined,
      date: planifie ? date : null,
      creneauId: creneau ?? undefined,
      nom,
      note,
      devis,
      minutesTrajet: itin?.minutesTrajet,
    };
    return construireMessage(d);
  }, [pret, service, depart, arrivee, devis, ref, optionChoisie, accesDepart, accesArrivee, immediat, deuxiemePersonne, heures, planifie, date, creneau, nom, note, itin]);

  return (
    <form className="carte lueur-calcul min-w-0 overflow-visible" onSubmit={(e) => e.preventDefault()} aria-label="Calculer le prix d'un transport">
      {/* En-tête du bon */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
        <p className="titre whitespace-nowrap text-[1.2rem] sm:text-[1.35rem]">Bon de transport</p>
        <p className="chiffres whitespace-nowrap font-mono text-[0.68rem] tracking-[0.08em] text-brume">{ref}</p>
      </div>

      {/* 1. Service */}
      <fieldset className="bon-section">
        <legend className="sr-only">Service</legend>
        <p className="bon-titre" aria-hidden>
          <span className="bon-num">1</span>Quel transport ?
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {SERVICES.map(({ id, icone: Icone, aide }) => (
            <button
              key={id}
              type="button"
              aria-pressed={service === id}
              onClick={() => setService(id)}
              className="group flex flex-col items-start gap-1 rounded-xl border border-filet bg-bitume p-3 text-left transition-colors hover:border-brume/60 aria-pressed:border-orange aria-pressed:bg-orange aria-pressed:text-encre"
            >
              <Icone className="h-6 w-6 text-orange group-aria-pressed:text-encre" aria-hidden />
              <span className="font-display text-[1.02rem] font-extrabold leading-tight">{NOMS_SERVICES[id]}</span>
              <span className="text-[0.8rem] leading-snug text-brume group-aria-pressed:text-encre/75">{aide}</span>
            </button>
          ))}
        </div>
      </fieldset>

      {/* 2. Adresses */}
      <div className="bon-section space-y-4">
        <p className="bon-titre">
          <span className="bon-num">2</span>D'où à où ?
        </p>
        <AdresseChamp
          label="Enlèvement"
          valeur={depart}
          onChange={setDepart}
          reference={ENTREPRISE.depot}
          avecPosition
          placeholder="Adresse de départ"
        />
        {avecEtages && depart && (
          <div className="apparait">
            <ChoixAcces valeur={accesDepart} onChange={setAccesDepart} />
          </div>
        )}
        <AdresseChamp
          label="Livraison"
          valeur={arrivee}
          onChange={setArrivee}
          reference={depart ?? ENTREPRISE.depot}
          placeholder="Adresse d'arrivée"
        />
        {avecEtages && arrivee && (
          <div className="apparait">
            <ChoixAcces valeur={accesArrivee} onChange={setAccesArrivee} />
          </div>
        )}
      </div>

      {/* 3. Détails */}
      {service && (
        <div className="bon-section apparait" key={`details-${service}`}>
          <p className="bon-titre">
            <span className="bon-num">3</span>
            {service === "demenagement" ? "Quel volume ?" : service === "chauffeur" ? "Combien de temps ?" : "Quel chargement ?"}
          </p>
          {opts.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2" role="radiogroup">
              {opts.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  role="radio"
                  aria-checked={optionId === o.id}
                  className="pastille flex-col !items-start !gap-0"
                  onClick={() => setOptions((p) => ({ ...p, [service]: o.id }))}
                >
                  <span>{o.label}</span>
                  <span className="text-[0.78rem] font-medium opacity-75">{o.detail}</span>
                </button>
              ))}
            </div>
          )}
          {service === "chauffeur" && (
            <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Nombre d'heures">
              {TARIFS.services.chauffeur.choixHeures.map((h) => (
                <button key={h} type="button" role="radio" aria-checked={heures === h} className="pastille chiffres" onClick={() => setHeures(h)}>
                  {h} h
                </button>
              ))}
            </div>
          )}
          {service === "marchandises" && (
            <label className="mt-3 flex items-center gap-3 text-[0.95rem] font-medium">
              <input
                type="checkbox"
                className="h-5 w-5 accent-[#FA5B07]"
                checked={deuxiemePersonne}
                onChange={(e) => setDeuxiemePersonne(e.target.checked)}
              />
              Ajouter une 2e personne pour porter (+{euros(TARIFS.services.marchandises.deuxiemePersonne)} HT)
            </label>
          )}
          {service === "demenagement" && optionChoisie?.id === "maison" && (
            <p className="mt-3 flex gap-2 text-[0.9rem] text-brume">
              <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              Pour une maison, on calcule le prix ensemble : envoyez la demande, on vous rappelle.
            </p>
          )}
        </div>
      )}

      {/* 4. Quand */}
      {service && (
        <div className="bon-section apparait" style={{ animationDelay: "80ms" }}>
          <p className="bon-titre">
            <span className="bon-num">4</span>Quand ?
          </p>
          {service === "express" && (
            <div className="mt-3 flex gap-2" role="radiogroup">
              <button type="button" role="radio" aria-checked={immediat} className="pastille" onClick={() => setImmediat(true)}>
                Dès que possible
                <span className="text-[0.78rem] font-medium opacity-75">+{Math.round(TARIFS.services.express.majorationImmediat * 100)} %</span>
              </button>
              <button type="button" role="radio" aria-checked={!immediat} className="pastille" onClick={() => setImmediat(false)}>
                Choisir un jour
              </button>
            </div>
          )}
          {planifie && (
            <>
              <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-5 sm:px-5" role="radiogroup" aria-label="Jour">
                {jours.map((j) => {
                  const choisi = date?.toDateString() === j.toDateString();
                  return (
                    <button
                      key={j.toISOString()}
                      type="button"
                      role="radio"
                      aria-checked={choisi}
                      className="pastille shrink-0 flex-col !gap-0 capitalize"
                      onClick={() => setDate(j)}
                    >
                      <span>{nomJour(j)}</span>
                      {j.getDay() === 0 && TARIFS.majorations.dimanche > 0 && (
                        <span className="text-[0.75rem] font-medium normal-case opacity-75">+{Math.round(TARIFS.majorations.dimanche * 100)} %</span>
                      )}
                    </button>
                  );
                })}
                <button type="button" className="pastille shrink-0" onClick={() => autreDateRef.current?.showPicker?.() ?? autreDateRef.current?.focus()}>
                  Autre date
                </button>
                <input
                  ref={autreDateRef}
                  type="date"
                  className="sr-only"
                  aria-label="Choisir une autre date"
                  min={jours[0].toISOString().slice(0, 10)}
                  onChange={(e) => {
                    if (!e.target.value) return;
                    const [a, m, j] = e.target.value.split("-").map(Number);
                    setDate(new Date(a, m - 1, j));
                  }}
                />
              </div>
              {date && !jours.some((j) => j.toDateString() === date.toDateString()) && (
                <p className="mt-2 text-[0.9rem] font-semibold capitalize">
                  {new Intl.DateTimeFormat("fr-BE", { weekday: "long", day: "numeric", month: "long" }).format(date)}
                </p>
              )}
              <div className="mt-3 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Créneau">
                {TARIFS.creneaux.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    role="radio"
                    aria-checked={creneau === c.id}
                    className="pastille flex-col !gap-0 justify-center text-center"
                    onClick={() => setCreneau(c.id)}
                  >
                    <span>{c.label}</span>
                    <span className="chiffres text-[0.78rem] font-medium opacity-75">{c.heures}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Ticket de prix */}
      <div id="prix" className="perfo mt-2 rounded-b-2xl px-4 pb-5 pt-5 sm:px-5" aria-live="polite">
        <Route
          depart={depart?.ville ?? "Enlèvement"}
          arrivee={arrivee?.ville ?? "Livraison"}
          km={itin ? itin.kmTrajet : null}
          minutes={itin?.minutesTrajet}
          chargement={calcul}
        />

        <div className="mt-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[0.9rem] font-semibold text-brume">
              {devis?.surDevis ? "Prix" : devis?.tvaApplicable === false ? "Prix estimé" : "Prix estimé TVAC"}
            </p>
            {devis && !devis.surDevis && (
              <p className="chiffres text-[0.8rem] text-brume">
                {Math.round(devis.kmTotal)} km au total, approche comprise
                {devis.voyages > 1 ? ` (${devis.voyages} voyages)` : ""}
              </p>
            )}
          </div>
          <p className="titre chiffres text-right text-[2.75rem] text-orange sm:text-[3.25rem]">
            {calcul ? "…" : devis ? devis.surDevis ? "Sur devis" : <CountUp valeur={devis.totalTTC} format={euros} /> : "— €"}
          </p>
        </div>

        {devis && !devis.surDevis && (
          <div className="mt-1">
            <button type="button" className="flex items-center gap-1 text-[0.9rem] font-semibold lien" onClick={() => setDetail((v) => !v)} aria-expanded={detail}>
              {detail ? "Masquer le détail" : "Voir le détail du prix"}
              <ChevronDown className={`h-4 w-4 transition-transform ${detail ? "rotate-180" : ""}`} aria-hidden />
            </button>
            {detail && (
              <dl className="apparait mt-2 space-y-1 text-[0.9rem]">
                {[...devis.lignes, ...devis.majorations].map((l) => (
                  <div key={l.label} className="flex justify-between gap-4">
                    <dt className="text-brume">{l.label}</dt>
                    <dd className="chiffres shrink-0">{euros(l.montant)}</dd>
                  </div>
                ))}
                {devis.minimumApplique && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-brume">Montant minimum de la course</dt>
                    <dd className="chiffres shrink-0">{euros(devis.totalHT)}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-4 border-t border-filet pt-1 font-semibold">
                  <dt>Total HTVA</dt>
                  <dd className="chiffres">{euros(devis.totalHT)}</dd>
                </div>
                {devis.tvaApplicable && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-brume">TVA {Math.round(TARIFS.tva.taux * 100)} %</dt>
                    <dd className="chiffres">{euros(devis.tva)}</dd>
                  </div>
                )}
              </dl>
            )}
          </div>
        )}

        {itin?.estimation && (
          <p className="mt-2 text-[0.8rem] text-brume">Distance estimée : le calcul d'itinéraire ne répond pas, on la vérifie avant de confirmer.</p>
        )}

        {/* Coordonnées facultatives */}
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-[0.85rem] font-semibold text-brume">Votre prénom (facultatif)</span>
            <input className="champ" value={nom} onChange={(e) => setNom(e.target.value)} autoComplete="given-name" />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-[0.85rem] font-semibold text-brume">Précisions (facultatif)</span>
            <textarea
              className="champ min-h-[76px] resize-y"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex. un frigo et un canapé, accès par la cour…"
            />
          </label>
        </div>

        {/* Envoi */}
        <div className="mt-4 space-y-2">
          {pret ? (
            <a href={lienWhatsApp(message)} target="_blank" rel="noreferrer" className="btn btn-orange w-full !text-[1.1rem]">
              <IconeWhatsApp className="h-6 w-6" />
              Envoyer sur WhatsApp
            </a>
          ) : (
            <button type="button" disabled className="btn btn-orange w-full !text-[1.1rem]">
              <IconeWhatsApp className="h-6 w-6" />
              Envoyer sur WhatsApp
            </button>
          )}
          {!pret && <p className="text-center text-[0.85rem] text-brume">Il manque : {manque.join(", ") || "le calcul de la distance"}.</p>}
          <div className="grid grid-cols-2 gap-2">
            {pret ? (
              <a href={lienSMS(message)} className="btn btn-sombre !text-[0.95rem]">
                <MessageSquareText className="h-5 w-5" aria-hidden />
                Par SMS
              </a>
            ) : (
              <button type="button" disabled className="btn btn-sombre !text-[0.95rem]">
                <MessageSquareText className="h-5 w-5" aria-hidden />
                Par SMS
              </button>
            )}
            <a href={lienAppel()} className="btn btn-sombre !text-[0.95rem]">
              <Phone className="h-5 w-5" aria-hidden />
              Appeler
            </a>
          </div>
          <p className="pt-1 text-[0.8rem] leading-snug text-brume">
            Prix calculé selon notre grille tarifaire. {ENTREPRISE.nom} vous confirme le prix et l'heure par WhatsApp avant toute
            intervention. Rien n'est réservé tant que vous n'avez pas reçu cette confirmation.
          </p>
        </div>
      </div>
    </form>
  );
}

function ChoixAcces({ valeur, onChange }: { valeur: Acces; onChange: (a: Acces) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2 pl-1">
      <label className="flex items-center gap-2 text-[0.9rem] font-medium">
        Étage
        <select
          className="champ w-auto py-1.5"
          value={valeur.etage}
          onChange={(e) => onChange({ ...valeur, etage: Number(e.target.value) })}
        >
          <option value={0}>Rez</option>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>
      {valeur.etage > 0 && (
        <div className="flex gap-2" role="radiogroup" aria-label="Ascenseur">
          <button type="button" role="radio" aria-checked={valeur.ascenseur} className="pastille py-1.5" onClick={() => onChange({ ...valeur, ascenseur: true })}>
            Avec ascenseur
          </button>
          <button type="button" role="radio" aria-checked={!valeur.ascenseur} className="pastille py-1.5" onClick={() => onChange({ ...valeur, ascenseur: false })}>
            Sans ascenseur
          </button>
        </div>
      )}
    </div>
  );
}
