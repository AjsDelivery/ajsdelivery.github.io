/**
 * ============================================================
 *  INFOS ENTREPRISE — AJS Delivery
 *  Modifie ce fichier directement sur GitHub : le site se met
 *  à jour tout seul en 1 à 2 minutes après l'enregistrement.
 * ============================================================
 */

export const ENTREPRISE = {
  nom: "AJS Delivery",
  slogan: "Le dernier kilomètre, redéfini.",

  // Téléphone affiché + utilisé pour les boutons Appeler / SMS
  telephoneAffiche: "0470 18 23 80",
  telephoneInternational: "+32470182380",

  // Numéro WhatsApp qui reçoit les demandes (format international, sans + ni espaces)
  whatsapp: "32470182380",

  email: "Ajsdelivery@outlook.com",

  horaires: "Lun – Sam : 7h – 20h",

  /**
   * Point de départ des camionnettes (dépôt).
   * Sert à calculer les km d'approche jusqu'au client.
   * Pour changer : clic droit sur Google Maps à la nouvelle adresse,
   * puis copie les 2 nombres en haut du menu (lat, lon).
   */
  depot: {
    label: "Binche (Route de Charleroi 64)",
    lat: 50.410843,
    lon: 4.187467,
  },

  zone: "Belgique (Bruxelles, Wallonie, Flandre) et pays limitrophes",

  /** Mentions légales obligatoires (Code de droit économique) */
  legal: {
    raisonSociale: "AJS Delivery",
    formeJuridique: "", // facultatif (ex. "Personne physique", "SRL") — laissé vide, la ligne ne s'affiche pas
    adresseSiege: "Route de Charleroi 64, 7134 Binche",
    numeroEntreprise: "1030.307.076",
    numeroTVA: "BE 1030.307.076",
  },
} as const;
