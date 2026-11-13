import { describe, expect, it } from "vitest";
import { calculerDevis } from "./devis";
import { TARIFS } from "../config/tarifs";

const MARDI = new Date(2026, 10, 17);
const DIMANCHE = new Date(2026, 10, 15);

describe("Livraison express", () => {
  it("prise en charge + km, approche dans la zone offerte", () => {
    const d = calculerDevis({ service: "express", option: "pli", kmApproche: 10, kmTrajet: 48, date: MARDI });
    expect(d.totalHT).toBe(77.8); // 25 + 48 × 1,10
    expect(d.tva).toBe(16.34);
    expect(d.totalTTC).toBe(94.14);
    expect(d.kmTotal).toBe(58);
  });

  it("colis volumineux + approche facturée + départ immédiat", () => {
    const d = calculerDevis({ service: "express", option: "colis", kmApproche: 30, kmTrajet: 48, immediat: true, date: MARDI });
    // 77,80 + 15,56 (×1,2) + 9,00 (15 km × 0,60) = 102,36 ; +25 % = 25,59
    expect(d.majorations[0].montant).toBe(25.59);
    expect(d.totalHT).toBe(127.95);
    expect(d.totalTTC).toBe(154.82);
  });

  it("applique le minimum", () => {
    const d = calculerDevis({ service: "express", option: "pli", kmApproche: 0, kmTrajet: 5 });
    expect(d.minimumApplique).toBe(true);
    expect(d.totalHT).toBe(39);
    expect(d.totalTTC).toBe(47.19);
  });
});

describe("Déménagement", () => {
  it("studio, étages sans ascenseur au départ, ascenseur à l'arrivée", () => {
    const d = calculerDevis({
      service: "demenagement",
      option: "studio",
      kmApproche: 20,
      kmTrajet: 33,
      depart: { etage: 2, ascenseur: false },
      arrivee: { etage: 3, ascenseur: true },
      date: MARDI,
    });
    // 3 h × 95 = 285 ; route 0,55 h × 95 = 52,25 ; 33 km × 1 = 33 ; étages 2 × 10 m³ × 3,5 = 70 ; approche 5 × 0,6 = 3
    expect(d.totalHT).toBe(443.25);
    expect(d.tva).toBe(93.08);
    expect(d.totalTTC).toBe(536.33);
    expect(d.voyages).toBe(1);
  });

  it("gros volume = plusieurs voyages (aller, retour, aller…)", () => {
    const d = calculerDevis({ service: "demenagement", option: "2ch", kmApproche: 0, kmTrajet: 20, date: MARDI });
    // 26 m³ / 12 → 3 voyages → 20 × 5 = 100 km ; route 100/60 h × 95 = 158,33 ; 7 h × 95 = 665
    expect(d.voyages).toBe(3);
    expect(d.kmTotal).toBe(100);
    expect(d.totalHT).toBe(923.33);
  });

  it("maison = sur devis, pas de prix automatique", () => {
    const d = calculerDevis({ service: "demenagement", option: "maison", kmApproche: 0, kmTrajet: 20 });
    expect(d.surDevis).toBe(true);
    expect(d.totalTTC).toBe(0);
  });
});

describe("Transport de marchandises", () => {
  it("étages sans ascenseur aux deux adresses + 2e personne", () => {
    const d = calculerDevis({
      service: "marchandises",
      option: "petit",
      kmApproche: 0,
      kmTrajet: 10,
      depart: { etage: 3, ascenseur: false },
      arrivee: { etage: 1, ascenseur: false },
      deuxiemePersonne: true,
    });
    // 35 + 9,50 + 4 étages × 10 + 45
    expect(d.totalHT).toBe(129.5);
  });

  it("majoration du dimanche", () => {
    const d = calculerDevis({ service: "marchandises", option: "demi", kmApproche: 0, kmTrajet: 50, date: DIMANCHE });
    // (35 + 47,50) = 82,50 ; ×1,3 → +24,75 ; sous-total 107,25 ; +25 % = 26,81
    expect(d.majorations[0].montant).toBe(26.81);
    expect(d.totalHT).toBe(134.06);
    expect(d.totalTTC).toBe(162.21);
  });
});

describe("Camionnette + chauffeur", () => {
  it("impose le minimum d'heures", () => {
    const d = calculerDevis({ service: "chauffeur", heures: 1, kmApproche: 0, kmTrajet: 12 });
    expect(d.totalHT).toBe(96.6); // 2 h × 45 + 12 × 0,55
  });
});

describe("TVA", () => {
  it("régime de franchise : pas de TVA", () => {
    const sansTVA = { ...TARIFS, tva: { assujetti: false, taux: 0.21 } } as unknown as typeof TARIFS;
    const d = calculerDevis({ service: "express", option: "pli", kmApproche: 0, kmTrajet: 48 }, sansTVA);
    expect(d.tva).toBe(0);
    expect(d.totalTTC).toBe(d.totalHT);
  });
});

describe("Arrondis", () => {
  it("arrondit les demi-centimes vers le haut (76,475 → 76,48)", () => {
    const d = calculerDevis({
      service: "demenagement",
      option: "studio",
      kmApproche: 41.8,
      kmTrajet: 48.3,
      depart: { etage: 2, ascenseur: false },
      arrivee: { etage: 0, ascenseur: false },
      date: MARDI,
    });
    // 285 + 76,48 + 48,30 + 70 + 16,08
    expect(d.totalHT).toBe(495.86);
    expect(d.totalTTC).toBe(599.99);
  });
});
