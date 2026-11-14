/**
 * ============================================================
 *  GRILLE TARIFAIRE — AJS Delivery
 * ------------------------------------------------------------
 *  C'est ICI que tu changes tes prix. Tous les montants sont
 *  HORS TVA (HT), en euros. Le site ajoute la TVA tout seul.
 *
 *  Comment modifier sur GitHub :
 *   1. Ouvre ce fichier sur github.com
 *   2. Clique sur le crayon ✏️ (Edit)
 *   3. Change uniquement les nombres
 *   4. "Commit changes" → le site est à jour en 1–2 minutes
 *
 *  Si tu fais une faute de frappe, le site NE casse PAS :
 *  l'ancienne version reste en ligne et GitHub t'affiche
 *  une croix rouge ❌ dans l'onglet "Actions".
 *
 *  Grille A « Équilibrée », validée en novembre 2026 : sous les
 *  prix des concurrents repérés en Belgique.
 * ============================================================
 */

export const TARIFS = {
  tva: {
    /** true = la TVA est ajoutée au prix. false = régime de franchise (pas de TVA). */
    assujetti: true,
    taux: 0.21,
  },

  kilometres: {
    /** Les premiers km entre le dépôt et le client sont offerts. */
    approcheOfferteKm: 15,
    /** Prix des km d'approche au-delà de la zone offerte (par km). */
    prixKmApproche: 0.5,
    /** Vitesse moyenne utilisée pour estimer le temps de route (déménagement). */
    vitesseMoyenneKmH: 60,
  },

  services: {
    /* ---------------------------------------------------------
     * LIVRAISON EXPRESS — colis urgents, départ rapide
     * prix = (prise en charge + km × prix/km) × coefficient taille
     * ------------------------------------------------------- */
    express: {
      priseEnCharge: 15,
      prixKm: 0.6,
      minimum: 25,
      tailles: [
        { id: "pli", label: "Pli ou petit colis", detail: "jusqu'à 5 kg", coef: 1 },
        { id: "colis", label: "Colis volumineux", detail: "jusqu'à 30 kg", coef: 1.2 },
        { id: "lourd", label: "Charge lourde", detail: "jusqu'à 300 kg", coef: 1.6 },
      ],
      /** Majoration si le client veut un départ immédiat (sous 2 h). 0.25 = +25 % */
      majorationImmediat: 0.2,
    },

    /* ---------------------------------------------------------
     * TRANSPORT DE MARCHANDISES — camionnette dédiée, sur rendez-vous
     * prix = (prise en charge + km × prix/km) × coefficient chargement
     *        + étages sans ascenseur + 2e personne éventuelle
     * ------------------------------------------------------- */
    marchandises: {
      priseEnCharge: 19,
      prixKm: 0.55,
      minimum: 35,
      chargements: [
        { id: "petit", label: "Quelques colis / 1 palette", detail: "≈ 2 m³", coef: 1 },
        { id: "demi", label: "Demi-camionnette", detail: "≈ 6 m³", coef: 1.3 },
        { id: "plein", label: "Camionnette pleine", detail: "≈ 12 m³", coef: 1.6 },
      ],
      /** Par étage sans ascenseur, par adresse */
      prixParEtage: 8,
      /** Forfait pour un 2e manutentionnaire */
      deuxiemePersonne: 35,
    },

    /* ---------------------------------------------------------
     * DÉMÉNAGEMENT — camionnette + 2 déménageurs
     * prix = heures × taux horaire (chargement + temps de route)
     *        + km × prix/km (× nombre d'allers si plusieurs voyages)
     *        + étages sans ascenseur
     * ------------------------------------------------------- */
    demenagement: {
      /** Camionnette + 2 déménageurs, par heure */
      tauxHoraire: 65,
      prixKm: 0.4,
      minimum: 130,
      /** Volume utile d'une camionnette (m³). Au-delà → plusieurs voyages. */
      capaciteCamionnetteM3: 12,
      /** Supplément par m³ et par étage sans ascenseur */
      prixParM3ParEtage: 2,
      volumes: [
        { id: "meubles", label: "Quelques meubles", detail: "≈ 5 m³", m3: 5, heures: 2 },
        { id: "studio", label: "Studio", detail: "≈ 10 m³", m3: 10, heures: 3 },
        { id: "1ch", label: "Appartement 1 chambre", detail: "≈ 18 m³", m3: 18, heures: 5 },
        { id: "2ch", label: "Appartement 2 chambres", detail: "≈ 26 m³", m3: 26, heures: 7 },
        /** surDevis = pas de prix automatique, AJS rappelle le client */
        { id: "maison", label: "Maison", detail: "sur devis", m3: 40, heures: 0, surDevis: true },
      ],
    },

    /* ---------------------------------------------------------
     * CAMIONNETTE + CHAUFFEUR — à l'heure
     * prix = heures (minimum imposé) × taux + km × prix/km
     * ------------------------------------------------------- */
    chauffeur: {
      tauxHoraire: 39,
      minimumHeures: 2,
      prixKm: 0.4,
      choixHeures: [2, 3, 4, 6, 8],
    },
  },

  /** Majorations selon le jour (0.25 = +25 %) */
  majorations: {
    dimanche: 0.25,
  },

  /** Créneaux proposés pour la prise de rendez-vous */
  creneaux: [
    { id: "matin", label: "Matin", heures: "8h – 12h" },
    { id: "aprem", label: "Après-midi", heures: "12h – 16h" },
    { id: "fin", label: "Fin de journée", heures: "16h – 20h" },
  ],
} as const;

export type Tarifs = typeof TARIFS;
