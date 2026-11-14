/**
 * ============================================================
 *  NOS PARTENAIRES — section « Nos partenaires » du site
 *  Pour ajouter un partenaire : copier un bloc { … } ci-dessous,
 *  mettre son logo dans src/assets/ et l'importer en haut.
 * ============================================================
 */
import logoMaringMe from "../assets/partenaire-maringme.webp";

export interface Partenaire {
  nom: string;
  /** Ce qu'il fait, en quelques mots (petite étiquette). */
  domaine: string;
  /** Deux ou trois phrases de présentation. Les mots entre [crochets]
   *  deviennent un lien vers son site (texte du lien utile pour Google). */
  texte: string;
  logo: string;
  /** Texte alternatif du logo (lu par Google et les lecteurs d'écran). */
  alt: string;
  /** Fond de la vignette du logo, aux couleurs du partenaire. */
  fondLogo: string;
  site: string;
  /** Texte du lien vers son site. */
  lien: string;
}

export const PARTENAIRES: Partenaire[] = [
  {
    nom: "MaringMe",
    domaine: "Mariage · Belgique et France",
    texte:
      "La plateforme qui réunit les futurs mariés et les [prestataires de mariage en Belgique] et en France, gratuite pour les couples. Pour le jour J, nous transportons la décoration, le mobilier et le matériel des prestataires.",
    logo: logoMaringMe,
    alt: "MaringMe, prestataires de mariage en Belgique",
    fondLogo: "#F7EDE1",
    site: "https://maringme.com",
    lien: "Voir les prestataires",
  },
];
