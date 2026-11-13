/**
 * Moteur de devis AJS Delivery.
 * Fonction pure : mêmes entrées → même prix. Aucune dépendance au navigateur,
 * pour pouvoir être réutilisée plus tard par un bot WhatsApp côté serveur.
 */
import { TARIFS, type Tarifs } from "../config/tarifs";

export type ServiceId = "express" | "marchandises" | "demenagement" | "chauffeur";

export interface Acces {
  etage: number; // 0 = rez-de-chaussée
  ascenseur: boolean;
}

export interface DevisInput {
  service: ServiceId;
  /** km dépôt → enlèvement (route) */
  kmApproche: number;
  /** km enlèvement → livraison (route) */
  kmTrajet: number;
  /** id de la taille / du chargement / du volume selon le service */
  option?: string;
  depart?: Acces;
  arrivee?: Acces;
  /** Express : départ immédiat */
  immediat?: boolean;
  /** Marchandises : 2e personne */
  deuxiemePersonne?: boolean;
  /** Chauffeur : nombre d'heures demandées */
  heures?: number;
  /** Date du rendez-vous (pour la majoration du dimanche) */
  date?: Date | null;
}

export interface Ligne {
  label: string;
  montant: number; // HT, en euros
}

export interface Devis {
  surDevis: boolean;
  lignes: Ligne[];
  majorations: Ligne[];
  minimumApplique: boolean;
  totalHT: number;
  tva: number;
  totalTTC: number;
  tvaApplicable: boolean;
  kmTotal: number; // km parcourus pour la mission (approche + trajet(s))
  voyages: number;
}

// petit epsilon : évite que 76,475 soit arrondi à 76,47 à cause des flottants
const arrondi = (n: number) => Math.round(n * 100 + 1e-7) / 100;
const km1 = (n: number) => Math.round(n * 10) / 10;
/** Nombres à la belge dans les libellés : 48,3 km × 1,10 € */
const fr = (n: number, dec: number) =>
  n.toLocaleString("fr-BE", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const km = (n: number) => fr(km1(n), Number.isInteger(km1(n)) ? 0 : 1);

function trouver<T extends { id: string }>(liste: readonly T[], id: string | undefined): T {
  return liste.find((o) => o.id === id) ?? liste[0];
}

function lignesApproche(kmApproche: number, t: Tarifs): Ligne[] {
  const facturable = Math.max(0, kmApproche - t.kilometres.approcheOfferteKm);
  if (facturable <= 0) return [];
  return [
    {
      label: `Approche (${km(facturable)} km au-delà des ${t.kilometres.approcheOfferteKm} km offerts)`,
      montant: facturable * t.kilometres.prixKmApproche,
    },
  ];
}

function supplementEtages(acces: Acces | undefined): number {
  if (!acces || acces.ascenseur) return 0;
  return Math.max(0, Math.floor(acces.etage));
}

export function calculerDevis(input: DevisInput, t: Tarifs = TARIFS): Devis {
  const kmApproche = Math.max(0, input.kmApproche || 0);
  const kmTrajet = Math.max(0, input.kmTrajet || 0);
  let lignes: Ligne[] = [];
  let minimum = 0;
  let voyages = 1;
  let surDevis = false;
  const coefs: { label: string; coef: number }[] = [];

  switch (input.service) {
    case "express": {
      const s = t.services.express;
      const taille = trouver(s.tailles, input.option);
      const base = s.priseEnCharge + kmTrajet * s.prixKm;
      lignes.push({ label: "Prise en charge", montant: s.priseEnCharge });
      lignes.push({ label: `Trajet ${km(kmTrajet)} km × ${fr(s.prixKm, 2)} €`, montant: kmTrajet * s.prixKm });
      if (taille.coef !== 1) {
        lignes.push({ label: `${taille.label} (×${taille.coef})`, montant: base * (taille.coef - 1) });
      }
      lignes.push(...lignesApproche(kmApproche, t));
      if (input.immediat) {
        coefs.push({ label: `Départ immédiat (+${Math.round(s.majorationImmediat * 100)} %)`, coef: s.majorationImmediat });
      }
      minimum = s.minimum;
      break;
    }

    case "marchandises": {
      const s = t.services.marchandises;
      const charge = trouver(s.chargements, input.option);
      const base = s.priseEnCharge + kmTrajet * s.prixKm;
      lignes.push({ label: "Prise en charge", montant: s.priseEnCharge });
      lignes.push({ label: `Trajet ${km(kmTrajet)} km × ${fr(s.prixKm, 2)} €`, montant: kmTrajet * s.prixKm });
      if (charge.coef !== 1) {
        lignes.push({ label: `${charge.label} (×${charge.coef})`, montant: base * (charge.coef - 1) });
      }
      const etages = supplementEtages(input.depart) + supplementEtages(input.arrivee);
      if (etages > 0) {
        lignes.push({ label: `Étages sans ascenseur (${etages})`, montant: etages * s.prixParEtage });
      }
      if (input.deuxiemePersonne) {
        lignes.push({ label: "2e personne pour la manutention", montant: s.deuxiemePersonne });
      }
      lignes.push(...lignesApproche(kmApproche, t));
      minimum = s.minimum;
      break;
    }

    case "demenagement": {
      const s = t.services.demenagement;
      const vol = trouver(s.volumes, input.option);
      if ("surDevis" in vol && vol.surDevis) {
        surDevis = true;
        break;
      }
      voyages = Math.max(1, Math.ceil(vol.m3 / s.capaciteCamionnetteM3));
      // Plusieurs voyages : aller, retour à vide, aller…
      const kmMission = kmTrajet * (2 * voyages - 1);
      const heuresRoute = kmMission / t.kilometres.vitesseMoyenneKmH;
      lignes.push({
        label: `Chargement / déchargement ${vol.heures} h × ${s.tauxHoraire} €`,
        montant: vol.heures * s.tauxHoraire,
      });
      if (heuresRoute > 0) {
        lignes.push({
          label: `Temps de route ≈ ${heuresRoute.toFixed(1).replace(".", ",")} h × ${s.tauxHoraire} €`,
          montant: heuresRoute * s.tauxHoraire,
        });
      }
      lignes.push({
        label:
          voyages > 1
            ? `Kilomètres ${km(kmMission)} km (${voyages} voyages) × ${fr(s.prixKm, 2)} €`
            : `Kilomètres ${km(kmMission)} km × ${fr(s.prixKm, 2)} €`,
        montant: kmMission * s.prixKm,
      });
      const etages = supplementEtages(input.depart) + supplementEtages(input.arrivee);
      if (etages > 0) {
        lignes.push({
          label: `Étages sans ascenseur (${etages} × ${vol.m3} m³)`,
          montant: etages * vol.m3 * s.prixParM3ParEtage,
        });
      }
      lignes.push(...lignesApproche(kmApproche, t));
      minimum = s.minimum;
      break;
    }

    case "chauffeur": {
      const s = t.services.chauffeur;
      const heures = Math.max(s.minimumHeures, input.heures ?? s.minimumHeures);
      lignes.push({ label: `Camionnette + chauffeur ${heures} h × ${s.tauxHoraire} €`, montant: heures * s.tauxHoraire });
      if (kmTrajet > 0) {
        lignes.push({ label: `Kilomètres ${km(kmTrajet)} km × ${fr(s.prixKm, 2)} €`, montant: kmTrajet * s.prixKm });
      }
      lignes.push(...lignesApproche(kmApproche, t));
      break;
    }
  }

  const kmTotal = km1(kmApproche + kmTrajet * (2 * voyages - 1));

  if (surDevis) {
    return {
      surDevis: true,
      lignes: [],
      majorations: [],
      minimumApplique: false,
      totalHT: 0,
      tva: 0,
      totalTTC: 0,
      tvaApplicable: t.tva.assujetti,
      kmTotal,
      voyages,
    };
  }

  lignes = lignes.map((l) => ({ ...l, montant: arrondi(l.montant) }));
  const sousTotal = arrondi(lignes.reduce((a, l) => a + l.montant, 0));

  if (input.date && input.date.getDay() === 0 && t.majorations.dimanche > 0) {
    coefs.push({ label: `Dimanche (+${Math.round(t.majorations.dimanche * 100)} %)`, coef: t.majorations.dimanche });
  }

  // Chaque majoration s'applique au sous-total (elles s'additionnent, pas de cumul en cascade)
  const majorations: Ligne[] = coefs.map((c) => ({ label: c.label, montant: arrondi(sousTotal * c.coef) }));
  const montantMaj = majorations.reduce((a, m) => a + m.montant, 0);

  let totalHT = arrondi(sousTotal + montantMaj);
  let minimumApplique = false;
  if (totalHT < minimum) {
    totalHT = minimum;
    minimumApplique = true;
  }

  const tva = t.tva.assujetti ? arrondi(totalHT * t.tva.taux) : 0;
  return {
    surDevis: false,
    lignes,
    majorations,
    minimumApplique,
    totalHT,
    tva,
    totalTTC: arrondi(totalHT + tva),
    tvaApplicable: t.tva.assujetti,
    kmTotal,
    voyages,
  };
}

export const euros = (n: number) =>
  new Intl.NumberFormat("fr-BE", { style: "currency", currency: "EUR" }).format(n);
