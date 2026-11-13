import { ENTREPRISE } from "../config/entreprise";
import { TARIFS } from "../config/tarifs";
import { euros, type Acces, type Devis, type ServiceId } from "./devis";
import { lienMaps, lienWaze, type Lieu } from "./geo";

export const NOMS_SERVICES: Record<ServiceId, string> = {
  demenagement: "Déménagement",
  express: "Livraison express",
  marchandises: "Transport de marchandises",
  chauffeur: "Camionnette + chauffeur",
};

export interface Demande {
  ref: string;
  service: ServiceId;
  optionLabel?: string;
  depart: Lieu;
  arrivee: Lieu;
  accesDepart?: Acces;
  accesArrivee?: Acces;
  immediat?: boolean;
  deuxiemePersonne?: boolean;
  heures?: number;
  date?: Date | null;
  creneauId?: string;
  nom?: string;
  note?: string;
  devis: Devis;
  minutesTrajet?: number;
}

export function nouvelleRef(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  const alea = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `AJS-${String(d.getFullYear()).slice(2)}${p(d.getMonth() + 1)}${p(d.getDate())}-${alea}`;
}

export function dateLongue(d: Date): string {
  return new Intl.DateTimeFormat("fr-BE", { weekday: "long", day: "numeric", month: "long" }).format(d);
}

function acces(a?: Acces): string {
  if (!a) return "";
  if (a.etage <= 0) return "rez-de-chaussée";
  return `${a.etage}e étage, ${a.ascenseur ? "avec" : "sans"} ascenseur`;
}

export function quandTexte(d: Demande): string {
  if (d.service === "express" && d.immediat) return "Dès que possible (départ immédiat)";
  if (!d.date) return "À convenir";
  const c = TARIFS.creneaux.find((x) => x.id === d.creneauId);
  const jour = dateLongue(d.date);
  return c ? `${jour}, ${c.label.toLowerCase()} (${c.heures})` : jour;
}

export function construireMessage(d: Demande): string {
  const L: string[] = [];
  L.push(`🚚 *Demande ${NOMS_SERVICES[d.service]}* — ${ENTREPRISE.nom}`);
  L.push(`Réf. ${d.ref}`);
  L.push("");
  if (d.optionLabel) L.push(`📦 ${d.optionLabel}`);
  if (d.heures) L.push(`⏱️ ${d.heures} h demandées`);
  if (d.deuxiemePersonne) L.push(`👥 2e personne pour la manutention`);
  L.push("");
  L.push(`📍 *Enlèvement :* ${d.depart.label}`);
  if (d.accesDepart && (d.service === "demenagement" || d.service === "marchandises")) L.push(`   ${acces(d.accesDepart)}`);
  L.push(`   Maps : ${lienMaps(d.depart)}`);
  L.push(`   Waze : ${lienWaze(d.depart)}`);
  L.push("");
  L.push(`🏁 *Livraison :* ${d.arrivee.label}`);
  if (d.accesArrivee && (d.service === "demenagement" || d.service === "marchandises")) L.push(`   ${acces(d.accesArrivee)}`);
  L.push("");
  L.push(`📅 *Quand :* ${quandTexte(d)}`);
  L.push("");
  if (d.devis.surDevis) {
    L.push(`💶 *Prix :* sur devis — merci de me rappeler pour l'estimer`);
  } else {
    const ttc = d.devis.tvaApplicable ? `${euros(d.devis.totalTTC)} TTC (${euros(d.devis.totalHT)} HT)` : euros(d.devis.totalTTC);
    L.push(`💶 *Prix estimé :* ${ttc}`);
    L.push(`📏 ${Math.round(d.devis.kmTotal)} km au total${d.devis.voyages > 1 ? `, ${d.devis.voyages} voyages` : ""}`);
  }
  if (d.nom?.trim()) L.push(`👤 ${d.nom.trim()}`);
  if (d.note?.trim()) {
    L.push("");
    L.push(`📝 ${d.note.trim()}`);
  }
  L.push("");
  L.push(d.service === "express" && d.immediat ? "Merci de me rappeler au plus vite." : "Merci de me confirmer le rendez-vous.");
  return L.join("\n");
}

export const lienWhatsApp = (texte: string) => `https://wa.me/${ENTREPRISE.whatsapp}?text=${encodeURIComponent(texte)}`;
// "?&body=" fonctionne à la fois sur iPhone et Android
export const lienSMS = (texte: string) => `sms:${ENTREPRISE.telephoneInternational}?&body=${encodeURIComponent(texte)}`;
export const lienAppel = () => `tel:${ENTREPRISE.telephoneInternational}`;
