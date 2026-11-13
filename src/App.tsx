import { useCallback, useEffect, useState } from "react";
import { Clock, Mail, Phone } from "lucide-react";
import { ENTREPRISE } from "./config/entreprise";
import { TARIFS } from "./config/tarifs";
import { euros } from "./lib/devis";
import { lienAppel } from "./lib/message";
import Calculateur from "./components/Calculateur";
import { IconeWhatsApp } from "./components/Route";

const ttc = (ht: number) => (TARIFS.tva.assujetti ? ht * (1 + TARIFS.tva.taux) : ht);
const prix = (ht: number) =>
  TARIFS.tva.assujetti ? (
    <>
      {euros(ttc(ht))} <span className="font-normal text-[0.85em] opacity-60">({euros(ht)} HTVA)</span>
    </>
  ) : (
    <>{euros(ht)}</>
  );

export function Entete() {
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
      <a href="./" className="flex items-baseline gap-1.5 font-display text-[1.6rem] font-extrabold leading-none tracking-tight">
        <span className="rounded-[5px] bg-encre px-1.5 pb-0.5 pt-1 text-orange">AJS</span>
        <span>Delivery</span>
      </a>
      <a href={lienAppel()} className="btn btn-noir !py-2.5 text-[1rem]">
        <Phone className="h-4 w-4" aria-hidden />
        <span className="chiffres">{ENTREPRISE.telephoneAffiche}</span>
      </a>
    </header>
  );
}

export function Pied() {
  const l = ENTREPRISE.legal;
  return (
    <footer className="bg-encre text-papier">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 text-[0.9rem] sm:grid-cols-[1.4fr_1fr] sm:px-6">
        <div className="space-y-1">
          <p className="font-display text-[1.2rem] font-extrabold">{ENTREPRISE.nom}</p>
          <p className="text-papier/70">{[l.raisonSociale, l.formeJuridique, l.adresseSiege].filter(Boolean).join(", ")}</p>
          {l.numeroEntreprise && <p className="text-papier/70">N° d'entreprise {l.numeroEntreprise}</p>}
          {l.numeroTVA && <p className="text-papier/70">TVA {l.numeroTVA}</p>}
          <p className="text-papier/70">© {new Date().getFullYear()} {ENTREPRISE.nom}</p>
        </div>
        <div className="space-y-1 sm:text-right">
          <p>
            <a className="lien" href="./mentions-legales.html">
              Mentions légales
            </a>
          </p>
          <p>
            <a className="lien" href="./confidentialite.html">
              Vie privée
            </a>
          </p>
          <p className="text-[0.8rem] text-papier/70">
            Cartes et adresses ©{" "}
            <a className="lien" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">
              OpenStreetMap
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

const ETAPES = [
  { titre: "Choisissez le transport", texte: "Déménagement, colis express, marchandises ou camionnette avec chauffeur." },
  { titre: "Indiquez les deux adresses", texte: "Votre position GPS en un geste, ou l'adresse tapée. Le calcul suit la route réelle." },
  { titre: "Le prix s'affiche", texte: "TVA comprise, avec le détail ligne par ligne : kilomètres, étages, temps." },
  { titre: "Envoyez sur WhatsApp", texte: "La demande part toute rédigée. On vous confirme le prix et l'heure." },
];

export default function App() {
  const [prixTTC, setPrixTTC] = useState<number | null>(null);
  const [ticketVisible, setTicketVisible] = useState(true);
  const onPrix = useCallback((p: number | null) => setPrixTTC(p), []);

  useEffect(() => {
    const el = document.getElementById("prix");
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setTicketVisible(e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const s = TARIFS.services;
  const lignesTarifs = [
    {
      nom: "Déménagement",
      desc: "Camionnette et deux déménageurs. Le temps de route est compté au même taux horaire.",
      prix: [
        ["Camionnette + 2 déménageurs, par heure", s.demenagement.tauxHoraire],
        ["Par kilomètre", s.demenagement.prixKm],
        ["Montant minimum", s.demenagement.minimum],
      ] as const,
    },
    {
      nom: "Livraison express",
      desc: "Un colis, une course, sans arrêt intermédiaire.",
      prix: [
        ["Prise en charge", s.express.priseEnCharge],
        ["Par kilomètre", s.express.prixKm],
        ["Montant minimum", s.express.minimum],
      ] as const,
    },
    {
      nom: "Transport de marchandises",
      desc: "Camionnette dédiée sur rendez-vous, du colis à la camionnette pleine.",
      prix: [
        ["Prise en charge", s.marchandises.priseEnCharge],
        ["Par kilomètre", s.marchandises.prixKm],
        ["Montant minimum", s.marchandises.minimum],
      ] as const,
    },
    {
      nom: "Camionnette + chauffeur",
      desc: `À l'heure, ${s.chauffeur.minimumHeures} h minimum. Vous dirigez, on conduit et on aide à charger.`,
      prix: [
        ["Par heure", s.chauffeur.tauxHoraire],
        ["Par kilomètre", s.chauffeur.prixKm],
      ] as const,
    },
  ];

  return (
    <>
      <Entete />

      <main>
        {/* Héros : le calculateur est la démonstration */}
        <section className="mx-auto grid max-w-6xl gap-8 px-4 pb-12 pt-2 sm:px-6 lg:grid-cols-[1fr_minmax(0,500px)] lg:gap-14 lg:pt-8">
          <div className="min-w-0 lg:sticky lg:top-8 lg:self-start">
            <h1 className="titre text-[3.1rem] sm:text-[4.4rem] lg:text-[5.2rem]">
              Votre prix de transport en une minute.
            </h1>
            <p className="mt-4 max-w-[34rem] text-[1.1rem] text-encre/80 sm:text-[1.2rem]">
              Déménagement, livraison express ou marchandises, en Belgique et vers les pays voisins. Entrez les deux adresses : le prix
              s'affiche, vous réservez sur WhatsApp.
            </p>

            <ol className="mt-8 hidden max-w-[34rem] space-y-4 lg:block">
              {ETAPES.map((e, i) => (
                <li key={e.titre} className="flex gap-4">
                  <span className="bon-num mt-0.5 !h-7 !w-7">{i + 1}</span>
                  <div>
                    <p className="font-display text-[1.2rem] font-bold leading-tight">{e.titre}</p>
                    <p className="text-encre/75">{e.texte}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div id="calcul" className="min-w-0 scroll-mt-4">
            <Calculateur onPrix={onPrix} />
          </div>
        </section>

        {/* Étapes (mobile) */}
        <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:hidden" aria-labelledby="t-etapes">
          <h2 id="t-etapes" className="titre text-[2.2rem]">
            Comment ça marche
          </h2>
          <ol className="mt-5 space-y-4">
            {ETAPES.map((e, i) => (
              <li key={e.titre} className="flex gap-4">
                <span className="bon-num mt-0.5 !h-7 !w-7">{i + 1}</span>
                <div>
                  <p className="font-display text-[1.2rem] font-bold leading-tight">{e.titre}</p>
                  <p className="text-encre/75">{e.texte}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Tarifs publics, tirés de la grille */}
        <section className="bg-encre text-papier" aria-labelledby="t-tarifs">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
            <h2 id="t-tarifs" className="titre text-[2.2rem] sm:text-[3rem]">
              Nos tarifs, sans surprise
            </h2>
            <p className="mt-3 max-w-[40rem] text-papier/70">
              Ce sont exactement les prix utilisés par le calculateur. Les {TARIFS.kilometres.approcheOfferteKm} premiers kilomètres
              entre notre dépôt et chez vous sont offerts
              {TARIFS.majorations.dimanche > 0 ? `, le dimanche est majoré de ${Math.round(TARIFS.majorations.dimanche * 100)} %` : ""}.
            </p>

            <div className="mt-8 divide-y divide-papier/25 border-y border-papier/25">
              {lignesTarifs.map((t) => (
                <div key={t.nom} className="grid gap-3 py-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] md:gap-10">
                  <div>
                    <h3 className="font-display text-[1.5rem] font-bold leading-tight">{t.nom}</h3>
                    <p className="mt-1 max-w-[30rem] text-papier/70">{t.desc}</p>
                  </div>
                  <dl className="space-y-1.5 self-center">
                    {t.prix.map(([label, ht]) => (
                      <div key={label} className="flex items-baseline justify-between gap-4 border-b border-dashed border-papier/20 pb-1.5 last:border-0">
                        <dt>{label}</dt>
                        <dd className="chiffres text-right font-semibold text-orange">{prix(ht)}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Zone + contact */}
        <section className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2" aria-labelledby="t-contact">
          <div>
            <h2 className="titre text-[2.2rem] sm:text-[2.6rem]">Où on roule</h2>
            <p className="mt-3 max-w-[30rem] text-[1.05rem]">
              Partout en Belgique : Bruxelles, Wallonie et Flandre. Et vers la France, les Pays-Bas, le Luxembourg et l'Allemagne.
            </p>
          </div>
          <div>
            <h2 id="t-contact" className="titre text-[2.2rem] sm:text-[2.6rem]">
              Nous joindre
            </h2>
            <ul className="mt-4 space-y-3 text-[1.05rem]">
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-encre" aria-hidden />
                <a className="lien-noir chiffres" href={lienAppel()}>
                  {ENTREPRISE.telephoneAffiche}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <IconeWhatsApp className="h-5 w-5 text-encre" />
                <a className="lien-noir" href={`https://wa.me/${ENTREPRISE.whatsapp}`} target="_blank" rel="noreferrer">
                  WhatsApp
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-encre" aria-hidden />
                <a className="lien-noir" href={`mailto:${ENTREPRISE.email}`}>
                  {ENTREPRISE.email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-encre" aria-hidden />
                {ENTREPRISE.horaires}
              </li>
            </ul>
          </div>
        </section>
      </main>

      <Pied />

      {/* Barre de prix collante sur mobile */}
      {prixTTC !== null && !ticketVisible && (
        <div className="fixed inset-x-0 bottom-0 z-40 bg-encre px-4 py-3 text-papier lg:hidden">
          <div className="mx-auto flex max-w-md items-center justify-between gap-3">
            <div>
              <p className="text-[0.8rem] text-papier/70">Prix estimé TVAC</p>
              <p className="titre chiffres text-[1.8rem] text-orange">{euros(prixTTC)}</p>
            </div>
            <a href="#prix" className="btn btn-orange">
              Envoyer la demande
            </a>
          </div>
        </div>
      )}
    </>
  );
}
