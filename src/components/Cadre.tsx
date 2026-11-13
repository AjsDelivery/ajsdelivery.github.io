/**
 * En-tête et pied de page, communs à toutes les pages.
 * L'en-tête porte la barre « le dernier kilomètre » de la vidéo :
 * le compteur descend jusqu'à 0,000 km pendant qu'on fait défiler la page,
 * et la camionnette avance sur la règle.
 */
import { useEffect, useState } from "react";
import { Clock, Mail, Phone } from "lucide-react";
import { ENTREPRISE } from "../config/entreprise";
import { lienAppel } from "../lib/message";
import logo from "../assets/logo.svg";
import { VanAJS } from "./Motion";
import { IconeWhatsApp } from "./Route";

export function Logo({ className = "" }: { className?: string }) {
  return <img src={logo} alt={ENTREPRISE.nom} width={735} height={288} className={className} decoding="async" />;
}

function useProgression() {
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const maj = () => {
      raf = 0;
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setP(max > 0 ? Math.min(1, Math.max(0, h.scrollTop / max)) : 0);
    };
    const planifier = () => {
      if (!raf) raf = requestAnimationFrame(maj);
    };
    maj();
    window.addEventListener("scroll", planifier, { passive: true });
    window.addEventListener("resize", planifier);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", planifier);
      window.removeEventListener("resize", planifier);
    };
  }, []);
  return p;
}

export function Entete() {
  const p = useProgression();
  const livre = p > 0.995;
  const km = (1 - p).toFixed(3).replace(".", ",");
  return (
    <header className="sticky top-0 z-40 border-b border-filet/70 bg-nuit/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 pt-2.5 sm:px-6">
        <a href="./" className="shrink-0" aria-label={`${ENTREPRISE.nom}, accueil`}>
          <Logo className="h-[34px] w-auto sm:h-10" />
        </a>
        <div className="flex items-center gap-3 sm:gap-5">
          <p className="chiffres font-mono text-[0.72rem] tracking-[0.14em] sm:text-[0.78rem]" aria-hidden>
            <span className="hidden text-brume lg:inline">LE DERNIER KILOMÈTRE&nbsp;&nbsp;</span>
            <span className="text-orange">{livre ? "0,000 KM · LIVRÉ ✓" : `${km} KM`}</span>
          </p>
          <a href={lienAppel()} className="btn btn-orange !px-3 !py-2.5 !text-[0.9rem]" aria-label={`Appeler le ${ENTREPRISE.telephoneAffiche}`}>
            <Phone className="h-4 w-4" aria-hidden />
            <span className="chiffres hidden sm:inline">{ENTREPRISE.telephoneAffiche}</span>
          </a>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 pb-2 pt-1.5 sm:px-6" aria-hidden>
        <div className="relative h-[15px]">
          <div className="regle absolute inset-x-0 bottom-0 h-[5px] border-b border-[#4a4a4a]" />
          <div className="absolute bottom-0 left-0 h-[2px] bg-orange" style={{ width: `${p * 100}%` }} />
          <div className="absolute bottom-[3px] w-[26px]" style={{ left: `calc(${p * 100}% - ${p * 26}px)` }}>
            <VanAJS className="h-auto w-full text-orange" />
          </div>
        </div>
      </div>
    </header>
  );
}

export function Pied() {
  const l = ENTREPRISE.legal;
  return (
    <footer className="relative overflow-hidden border-t border-filet bg-nuit">
      <div className="horizon pointer-events-none absolute inset-x-0 top-0 h-[420px] rotate-180" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-4 pb-8 pt-16 text-center sm:px-6">
        <Logo className="logo-lueur mx-auto h-auto w-[240px] sm:w-[300px]" />
        <p className="etiquette mt-6">Transport · Livraison express · Déménagement</p>
        <ul className="mt-6 flex flex-col items-center gap-2.5 text-[1.05rem]">
          <li className="flex items-center gap-2.5">
            <Phone className="h-4 w-4 text-orange" aria-hidden />
            <a className="lien chiffres" href={lienAppel()}>
              {ENTREPRISE.telephoneAffiche}
            </a>
          </li>
          <li className="flex items-center gap-2.5">
            <IconeWhatsApp className="h-4 w-4 text-orange" />
            <a className="lien" href={`https://wa.me/${ENTREPRISE.whatsapp}`} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
          </li>
          <li className="flex items-center gap-2.5">
            <Mail className="h-4 w-4 text-orange" aria-hidden />
            <a className="lien" href={`mailto:${ENTREPRISE.email}`}>
              {ENTREPRISE.email}
            </a>
          </li>
          <li className="flex items-center gap-2.5 text-brume">
            <Clock className="h-4 w-4 text-orange" aria-hidden />
            {ENTREPRISE.horaires}
          </li>
        </ul>

        <div className="mt-14 grid gap-4 border-t border-filet pt-6 text-left text-[0.85rem] text-brume sm:grid-cols-[1.4fr_1fr]">
          <div className="space-y-0.5">
            <p>{[l.raisonSociale, l.formeJuridique, l.adresseSiege].filter(Boolean).join(", ")}</p>
            {l.numeroEntreprise && <p>N° d'entreprise {l.numeroEntreprise}</p>}
            {l.numeroTVA && <p>TVA {l.numeroTVA}</p>}
            <p>
              © {new Date().getFullYear()} {ENTREPRISE.nom}
            </p>
          </div>
          <div className="space-y-0.5 sm:text-right">
            <p>
              <a className="lien text-craie" href="./mentions-legales.html">
                Mentions légales
              </a>
            </p>
            <p>
              <a className="lien text-craie" href="./confidentialite.html">
                Vie privée
              </a>
            </p>
            <p>
              Cartes et adresses ©{" "}
              <a className="lien" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">
                OpenStreetMap
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
