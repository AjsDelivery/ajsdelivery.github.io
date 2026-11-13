import { useCallback, useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Package, Phone, Sofa, Truck, Zap } from "lucide-react";
import { ENTREPRISE } from "./config/entreprise";
import { TARIFS } from "./config/tarifs";
import { euros } from "./lib/devis";
import { lienAppel } from "./lib/message";
import Calculateur from "./components/Calculateur";
import Carte from "./components/Carte";
import { Entete, Pied } from "./components/Cadre";
import { BandeOrange, CountUp, Reveal, VanAJS, reduireAnimations } from "./components/Motion";
import type { ServiceId } from "./lib/devis";
import vw from "./assets/vw.webp";
import man from "./assets/man.webp";

const ttc = (ht: number) => (TARIFS.tva.assujetti ? ht * (1 + TARIFS.tva.taux) : ht);
const prix = (ht: number) =>
  TARIFS.tva.assujetti ? (
    <>
      {euros(ttc(ht))} <span className="text-[0.85em] font-normal text-brume">({euros(ht)} HTVA)</span>
    </>
  ) : (
    <>{euros(ht)}</>
  );

const ETAPES = [
  { titre: "Choisissez le transport", texte: "Déménagement, colis express, marchandises ou camionnette avec chauffeur." },
  { titre: "Indiquez les deux adresses", texte: "Votre position GPS en un geste, ou l'adresse tapée. Le calcul suit la route réelle." },
  { titre: "Le prix s'affiche", texte: "TVA comprise, avec le détail ligne par ligne : kilomètres, étages, temps." },
  { titre: "Envoyez sur WhatsApp", texte: "La demande part toute rédigée. On vous confirme le prix et l'heure." },
];

const SERVICES: { id: ServiceId; icone: typeof Truck; titre: string; texte: string; points: string[] }[] = [
  {
    id: "marchandises",
    icone: Package,
    titre: "Transport de marchandises",
    texte: "Vos marchandises voyagent avec soin et ponctualité, en Belgique et vers les pays voisins. Le métier de sous-traitant GLS nous a appris les standards logistiques les plus exigeants.",
    points: ["Livraison sécurisée", "Belgique et pays voisins", "Du colis à la camionnette pleine"],
  },
  {
    id: "express",
    icone: Zap,
    titre: "Livraison express",
    texte: "Une livraison urgente ? On prend votre colis en charge tout de suite et on le livre dans les meilleurs délais, sans arrêt intermédiaire.",
    points: ["Prise en charge immédiate", "Livraison le jour même", "Une course, un colis"],
  },
  {
    id: "demenagement",
    icone: Sofa,
    titre: "Déménagement",
    texte: "Particulier ou entreprise, on s'occupe de votre déménagement de A à Z : chargement, transport et déchargement.",
    points: ["Service clé en main", "Protection des biens", "Prix selon le volume et les étages"],
  },
  {
    id: "chauffeur",
    icone: Truck,
    titre: "Camionnette + chauffeur",
    texte: "Pour tout ce qui tient dans une camionnette : meubles, matériaux, équipements. Vous dirigez, on conduit et on aide à charger.",
    points: ["Transport sur mesure", "À l'heure, 2 h minimum", "Horaires flexibles"],
  },
];

const VALEURS = [
  { titre: "Fiabilité", texte: "Chaque engagement est tenu. Vos marchandises arrivent en sécurité, à l'heure." },
  { titre: "Rapidité", texte: "Des délais courts grâce à une logistique rodée au rythme de la livraison de colis." },
  { titre: "Professionnalisme", texte: "Une équipe formée aux standards du secteur logistique, du chargement à la remise en main propre." },
];

const FAQ = [
  {
    q: "Quels types de marchandises transportez-vous ?",
    r: "Tout ce qui tient dans nos camionnettes : colis, meubles, électroménager, matériaux de construction, équipements professionnels et bien plus encore.",
  },
  {
    q: "Quelle est votre zone de couverture ?",
    r: "Principalement la Belgique (Bruxelles, Wallonie, Flandre), et aussi les pays limitrophes : France, Pays-Bas, Luxembourg et Allemagne.",
  },
  {
    q: "Comment obtenir un devis ?",
    r: "Le calculateur de cette page vous donne le prix en une minute. Envoyez ensuite la demande sur WhatsApp, ou appelez-nous : on vous répond sous 2 heures pendant nos horaires.",
  },
  {
    q: "Proposez-vous un déménagement complet ?",
    r: "Oui : chargement, transport et déchargement, pour les particuliers comme pour les entreprises. Pour une maison entière, on établit le prix ensemble.",
  },
  {
    q: "Êtes-vous assurés ?",
    r: "Oui. Toutes nos prestations sont couvertes par une assurance professionnelle tous risques, pour la sécurité de vos biens.",
  },
  {
    q: "Le prix affiché est-il définitif ?",
    r: "C'est une estimation calculée avec notre grille tarifaire et la distance réelle par la route. On vous confirme le prix et l'heure avant toute intervention.",
  },
];

const milliers = (n: number) => new Intl.NumberFormat("fr-BE").format(Math.round(n));

const CHIFFRES = [
  { n: 30000, f: (v: number) => `${milliers(v)}+`, l: "colis livrés" },
  { n: 2, f: (v: number) => `${Math.round(v)}`, l: "camionnettes en service" },
  { n: 5, f: (v: number) => `${Math.round(v)}`, l: "pays desservis" },
  { n: 2, f: (v: number) => `${Math.round(v)} h`, l: "pour vous répondre, au plus" },
];

/** Démarre le défilement d'un nombre quand il entre à l'écran */
function Compteur({ cible, format }: { cible: number; format: (n: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [valeur, setValeur] = useState(reduireAnimations() ? cible : 0);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduireAnimations()) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setValeur(cible);
          io.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [cible]);
  return (
    <span ref={ref}>
      <CountUp valeur={valeur} format={format} duree={1800} />
    </span>
  );
}

function choisirService(id: ServiceId) {
  window.dispatchEvent(new CustomEvent("ajs:service", { detail: id }));
  document.getElementById("calcul")?.scrollIntoView({ behavior: reduireAnimations() ? "auto" : "smooth", block: "start" });
}

function QuestionFAQ({ q, r }: { q: string; r: string }) {
  const [ouvert, setOuvert] = useState(false);
  return (
    <div className={`carte transition-colors ${ouvert ? "border-orange/60" : ""}`}>
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[1.05rem] font-bold leading-snug"
        aria-expanded={ouvert}
        onClick={() => setOuvert((v) => !v)}
      >
        {q}
        <ChevronDown className={`h-5 w-5 shrink-0 text-orange transition-transform duration-300 ${ouvert ? "rotate-180" : ""}`} aria-hidden />
      </button>
      <div className="repli" data-ouvert={ouvert}>
        <div>
          <p className="max-w-[62ch] px-5 pb-5 text-brume">{r}</p>
        </div>
      </div>
    </div>
  );
}

/** Les deux vraies camionnettes, posées sur la route, avec le trait de lumière */
function Flotte() {
  return (
    <div className="relative">
      <div className="relative mx-auto aspect-[100/60] w-full max-w-[640px]">
        <div className="trait-lumiere absolute left-[-30%] right-[-30%] top-[46%] lg:left-[-6%] lg:right-[-40%]" aria-hidden />
        <div className="van-entre second absolute right-0 top-0 w-[64%]">
          <img
            src={man}
            width={820}
            height={503}
            alt="La camionnette MAN aux couleurs AJS Delivery"
            className="relative h-auto w-full"
            fetchPriority="high"
          />
          <span className="reflet" aria-hidden />
        </div>
        <div className="van-entre absolute bottom-0 left-0 w-[62%]">
          <img
            src={vw}
            width={820}
            height={485}
            alt="La camionnette VW Crafter aux couleurs AJS Delivery"
            className="relative h-auto w-full"
            fetchPriority="high"
          />
          <span className="reflet" aria-hidden />
        </div>
      </div>
      <ul className="entree relative mt-4 flex flex-wrap justify-center gap-2 lg:justify-end" style={{ animationDelay: "1.4s" }}>
        {["VW Crafter", "MAN"].map((t) => (
          <li key={t} className="inline-flex items-center gap-2 rounded-md bg-orange px-2.5 py-1.5 font-mono text-[0.7rem] font-medium uppercase tracking-[0.14em] text-encre">
            <span className="point-vivant h-1.5 w-1.5 rounded-full bg-encre" aria-hidden />
            {t} · en service
          </li>
        ))}
      </ul>
    </div>
  );
}

function Services() {
  const rail = useRef<HTMLDivElement>(null);
  const [actif, setActif] = useState(0);
  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    const maj = () => {
      const enfant = el.firstElementChild as HTMLElement | null;
      if (!enfant) return;
      setActif(Math.round(el.scrollLeft / (enfant.offsetWidth + 12)));
    };
    el.addEventListener("scroll", maj, { passive: true });
    return () => el.removeEventListener("scroll", maj);
  }, []);

  return (
    <section id="services" className="scroll-mt-20 border-y border-filet bg-[#151515]" aria-labelledby="t-services">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <Reveal className="flex items-end justify-between gap-4">
          <div>
            <p className="etiquette">Ce que nous faisons</p>
            <h2 id="t-services" className="titre mt-3 text-[clamp(2.4rem,8vw,4rem)]">
              Nos services
            </h2>
          </div>
          <p className="chiffres pb-2 font-mono text-[0.8rem] tracking-[0.14em] text-brume md:hidden" aria-hidden>
            {String(Math.min(actif + 1, SERVICES.length)).padStart(2, "0")} / {String(SERVICES.length).padStart(2, "0")}
          </p>
        </Reveal>
        <div
          ref={rail}
          className="-mx-4 mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-2 md:gap-4 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {SERVICES.map(({ id, icone: Icone, titre, texte, points }, i) => (
            <Reveal
              key={id}
              delai={(i % 2) * 120}
              as="article"
              className="carte carte-service relative flex w-[86%] shrink-0 snap-center flex-col overflow-hidden p-5 sm:p-6 md:w-auto"
            >
              <span className="contour-texte titre pointer-events-none absolute right-4 top-3 text-[3.6rem] leading-none" aria-hidden>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-orange/15 text-orange ring-1 ring-orange/40">
                <Icone className="h-6 w-6" aria-hidden />
              </span>
              <h3 className="titre mt-5 text-[1.55rem] sm:text-[1.8rem]">{titre}</h3>
              <p className="mt-3 text-brume">{texte}</p>
              <ul className="mt-4 space-y-1.5">
                {points.map((p) => (
                  <li key={p} className="flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0 text-orange" aria-hidden />
                    {p}
                  </li>
                ))}
              </ul>
              <button type="button" className="btn btn-orange mt-6 self-start !py-3 !text-[0.85rem]" onClick={() => choisirService(id)}>
                Calculer ce prix
              </button>
            </Reveal>
          ))}
        </div>
        <div className="mt-5 flex justify-center gap-1.5 md:hidden" aria-hidden>
          {SERVICES.map((s, i) => (
            <span key={s.id} className={`h-[3px] rounded-full transition-all duration-300 ${i === actif ? "w-8 bg-orange" : "w-4 bg-filet"}`} />
          ))}
        </div>
      </div>
    </section>
  );
}

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
        {/* Héros : la route de nuit et les deux camionnettes */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="horizon absolute inset-x-0 bottom-[30%] h-[60%] lg:bottom-[22%] lg:left-[36%]" />
            <div className="absolute inset-x-0 bottom-0 h-[52%] lg:left-[36%] lg:h-[58%]">
              <div className="route3d" />
            </div>
          </div>

          <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 pb-10 pt-10 sm:px-6 lg:min-h-[min(calc(100svh-84px),780px)] lg:grid-cols-[1.12fr_1fr] lg:gap-6 lg:pb-14 lg:pt-6">
            <div className="min-w-0">
              <p className="entree inline-flex rounded-md border border-orange/40 bg-orange/10 px-3 py-1.5 font-mono text-[0.72rem] font-medium uppercase tracking-[0.2em] text-orange">
                Sous-traitant GLS<span className="hidden sm:inline">&nbsp;· 30 000+ colis livrés</span>
              </p>
              <h1 className="titre mt-5 text-[clamp(2.4rem,13vw,6rem)] lg:text-[4.3rem] xl:text-[5.1rem]">
                <span className="ligne-titre">
                  <span>Le dernier</span>
                </span>
                <span className="ligne-titre">
                  <span className="text-orange">kilomètre,</span>
                </span>
                <span className="ligne-titre">
                  <span>redéfini.</span>
                </span>
              </h1>
              <p className="entree mt-5 max-w-[32rem] text-[1.08rem] text-craie/80 sm:text-[1.15rem]" style={{ animationDelay: "0.5s" }}>
                Transport de marchandises, livraison express, déménagement : AJS Delivery assure chaque mission avec précision et rapidité.
                Votre prix s'affiche en une minute, vous réservez sur WhatsApp.
              </p>
              <div className="entree mt-7 flex flex-wrap gap-3" style={{ animationDelay: "0.62s" }}>
                <a href="#calcul" className="btn btn-orange">
                  Calculer mon prix
                </a>
                <a href="#services" className="btn btn-contour">
                  Nos services
                </a>
              </div>
            </div>
            <Flotte />
          </div>
        </section>

        {/* Calculateur */}
        <section id="calcul" className="scroll-mt-20 border-t border-filet bg-nuit" aria-labelledby="t-calcul">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1fr_minmax(0,520px)] lg:gap-14">
            <div className="min-w-0 lg:sticky lg:top-28 lg:self-start">
              <Reveal>
                <p className="etiquette">Devis instantané</p>
                <h2 id="t-calcul" className="titre mt-3 text-[clamp(2.4rem,8vw,4rem)]">
                  Votre prix
                  <br />
                  <span className="text-orange">en une minute.</span>
                </h2>
                <p className="mt-4 max-w-[32rem] text-[1.05rem] text-brume">
                  Entrez les deux adresses, le prix s'affiche avec le détail. Les {TARIFS.kilometres.approcheOfferteKm} premiers kilomètres
                  depuis Binche sont offerts.
                </p>
              </Reveal>
              <ol className="mt-8 hidden max-w-[32rem] space-y-5 lg:block">
                {ETAPES.map((e, i) => (
                  <Reveal as="li" key={e.titre} delai={i * 90} className="flex gap-4">
                    <span className="chiffres mt-0.5 font-mono text-[0.85rem] text-orange">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <p className="font-bold leading-tight">{e.titre}</p>
                      <p className="text-brume">{e.texte}</p>
                    </div>
                  </Reveal>
                ))}
              </ol>
            </div>

            <div className="min-w-0">
              <Calculateur onPrix={onPrix} />
            </div>

            <ol className="space-y-4 lg:hidden">
              {ETAPES.map((e, i) => (
                <Reveal as="li" key={e.titre} delai={i * 80} className="flex gap-4">
                  <span className="chiffres mt-0.5 font-mono text-[0.85rem] text-orange">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <p className="font-bold leading-tight">{e.titre}</p>
                    <p className="text-brume">{e.texte}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        <BandeOrange
          messages={["Livraison rapide", "Assurance tous risques", "Sous-traitant GLS", "Réponse sous 2 h", "Belgique et pays voisins"]}
          filigrane="Rapide · Assuré ·"
        />

        <Services />

        {/* Zone de couverture */}
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 md:grid-cols-[1fr_1.1fr]" aria-labelledby="t-zone">
          <Reveal>
            <p className="etiquette">Zone de couverture</p>
            <h2 id="t-zone" className="titre mt-3 text-[clamp(2.4rem,8vw,4rem)]">
              Belgique
              <br />
              <span className="text-orange">+ pays limitrophes</span>
            </h2>
            <p className="mt-4 max-w-[30rem] text-[1.05rem] text-brume">
              Bruxelles, Wallonie et Flandre, et vers la France, les Pays-Bas, le Luxembourg et l'Allemagne. Départ de Binche.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {["Bruxelles", "Wallonie", "Flandre", "France", "Pays-Bas", "Luxembourg", "Allemagne"].map((z) => (
                <li key={z} className="rounded-md border border-filet px-2.5 py-1 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-craie/85">
                  {z}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delai={100} className="mx-auto w-full max-w-[520px]">
            <Carte />
          </Reveal>
        </section>

        {/* En chiffres */}
        <section className="border-y border-filet bg-[#151515]" aria-labelledby="t-chiffres">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <Reveal>
              <p className="etiquette">En chiffres</p>
              <h2 id="t-chiffres" className="titre mt-3 text-[clamp(2.4rem,8vw,4rem)]">
                Pourquoi nous choisir
              </h2>
              <p className="mt-4 max-w-[38rem] text-[1.05rem] text-brume">
                Avant ce site, nous avons livré des dizaines de milliers de colis comme sous-traitant GLS. Cette rigueur, on la met
                maintenant dans chacun de vos transports.
              </p>
            </Reveal>
            <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-[1.45fr_1fr_1fr_1.15fr]">
              {CHIFFRES.map((c, i) => (
                <Reveal key={c.l} delai={i * 90} className={i === 0 ? "col-span-2 md:col-span-1" : ""}>
                  <p className="titre chiffres whitespace-nowrap text-[clamp(2.6rem,11vw,4rem)] text-orange">
                    <Compteur cible={c.n} format={c.f} />
                  </p>
                  <span className="trait-chiffre mt-2 block h-[2px] w-16 bg-orange" aria-hidden />
                  <p className="mt-3 font-mono text-[0.72rem] uppercase leading-relaxed tracking-[0.14em] text-brume">{c.l}</p>
                </Reveal>
              ))}
            </div>
            <div className="mt-14 grid gap-8 border-t border-filet pt-10 md:grid-cols-3">
              {VALEURS.map((v, i) => (
                <Reveal key={v.titre} delai={i * 100}>
                  <h3 className="titre text-[1.5rem]">{v.titre}</h3>
                  <p className="mt-2 text-brume">{v.texte}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Tarifs publics, tirés de la grille */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20" aria-labelledby="t-tarifs">
          <Reveal>
            <p className="etiquette">Tarifs</p>
            <h2 id="t-tarifs" className="titre mt-3 text-[clamp(2.4rem,8vw,4rem)]">
              Sans surprise
            </h2>
            <p className="mt-4 max-w-[40rem] text-[1.05rem] text-brume">
              Ce sont exactement les prix utilisés par le calculateur. Les {TARIFS.kilometres.approcheOfferteKm} premiers kilomètres depuis
              Binche sont offerts
              {TARIFS.majorations.dimanche > 0 ? `, le dimanche est majoré de ${Math.round(TARIFS.majorations.dimanche * 100)} %` : ""}.
            </p>
          </Reveal>
          <div className="mt-8 divide-y divide-filet border-y border-filet">
            {lignesTarifs.map((t, i) => (
              <Reveal key={t.nom} delai={i * 60} className="grid gap-3 py-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] md:gap-10">
                <div>
                  <h3 className="titre text-[1.4rem]">{t.nom}</h3>
                  <p className="mt-1.5 max-w-[30rem] text-brume">{t.desc}</p>
                </div>
                <dl className="space-y-1.5 self-center">
                  {t.prix.map(([label, ht]) => (
                    <div key={label} className="flex items-baseline justify-between gap-4 border-b border-dashed border-filet pb-1.5 last:border-0">
                      <dt>{label}</dt>
                      <dd className="chiffres text-right font-semibold text-orange">{prix(ht)}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-4 pb-20 sm:px-6" aria-labelledby="t-faq">
          <Reveal>
            <p className="etiquette">FAQ</p>
            <h2 id="t-faq" className="titre mt-3 text-[clamp(2.4rem,8vw,4rem)]">
              Questions fréquentes
            </h2>
          </Reveal>
          <div className="mt-8 space-y-3">
            {FAQ.map((f, i) => (
              <Reveal key={f.q} delai={i * 50}>
                <QuestionFAQ q={f.q} r={f.r} />
              </Reveal>
            ))}
          </div>
        </section>

        {/* Appel final, sur l'orange */}
        <section className="relative overflow-hidden bg-orange text-encre">
          <Reveal className="pointer-events-none absolute -right-8 bottom-[-4%] w-[min(520px,78vw)]">
            <VanAJS className="h-auto w-full text-encre/[0.13]" />
          </Reveal>
          <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <Reveal>
              <p className="font-mono text-[0.72rem] font-medium uppercase tracking-[0.2em]">Réponse sous 2 heures</p>
              <h2 className="titre mt-3 max-w-[14ch] text-[clamp(2.4rem,8vw,4.4rem)]">Obtenez votre prix maintenant</h2>
              <p className="mt-4 max-w-[34rem] text-[1.05rem] font-medium text-encre/80">
                Décrivez votre transport, le prix s'affiche tout de suite. On vous confirme l'heure sur WhatsApp.
              </p>
            </Reveal>
            <Reveal delai={150} className="mt-7 flex flex-wrap gap-3">
              <a href="#calcul" className="btn btn-noir">
                Calculer mon prix
              </a>
              <a href={lienAppel()} className="btn border-2 border-encre text-encre hover:bg-encre hover:text-craie">
                <Phone className="h-5 w-5" aria-hidden />
                <span className="chiffres">{ENTREPRISE.telephoneAffiche}</span>
              </a>
            </Reveal>
          </div>
        </section>
      </main>

      <Pied />

      {/* Barre de prix collante sur mobile */}
      {prixTTC !== null && !ticketVisible && (
        <div className="monte-bas fixed inset-x-0 bottom-0 z-40 border-t border-orange/50 bg-asphalte/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-md items-center justify-between gap-3">
            <div>
              <p className="text-[0.8rem] text-brume">Prix estimé TVAC</p>
              <p className="titre chiffres text-[1.8rem] text-orange">{euros(prixTTC)}</p>
            </div>
            <a href="#prix" className="btn btn-orange !text-[0.9rem]">
              Envoyer la demande
            </a>
          </div>
        </div>
      )}
    </>
  );
}
