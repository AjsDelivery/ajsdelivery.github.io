/**
 * ============================================================
 *  INFOS ENTREPRISE — AJS Delivery
 *  Modifie ce fichier directement sur GitHub : le site se met
 *  à jour tout seul en 1 à 2 minutes après l'enregistrement.
 *  Les champs marqués "À COMPLÉTER" doivent être remplis avant
 *  la mise en ligne publique.
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
   * À COMPLÉTER : remplace par l'adresse et les coordonnées réelles
   * (clic droit sur Google Maps → les 2 nombres en haut du menu).
   */
  depot: {
    label: "Charleroi", // À COMPLÉTER
    lat: 50.4108, // À COMPLÉTER
    lon: 4.4446, // À COMPLÉTER
  },

  zone: "Belgique (Bruxelles, Wallonie, Flandre) et pays limitrophes",

  /**
   * Mentions légales obligatoires (Code de droit économique).
   * À COMPLÉTER avant la mise en ligne.
   */
  legal: {
    raisonSociale: "AJS Delivery", // À COMPLÉTER (nom de la personne ou de la société)
    formeJuridique: "", // À COMPLÉTER (ex. "Personne physique", "SRL")
    adresseSiege: "", // À COMPLÉTER
    numeroEntreprise: "", // À COMPLÉTER (ex. "1234.567.890")
    numeroTVA: "", // À COMPLÉTER (ex. "BE 1234.567.890") — vide si franchise de TVA
  },
} as const;
