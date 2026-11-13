# AJS Delivery — devis en une minute, réservation sur WhatsApp

Site de transport (déménagement, livraison express, marchandises, camionnette + chauffeur).
Le client choisit le service, indique les deux adresses (ou sa position GPS), le prix s'affiche
selon la grille tarifaire, puis il envoie sa demande toute rédigée sur le WhatsApp d'AJS.

## Changer les prix

Tout est dans **`src/config/tarifs.ts`** (montants HTVA, la TVA est ajoutée automatiquement).

1. Ouvre le fichier sur GitHub, clique sur le crayon ✏️
2. Change les nombres
3. « Commit changes » → le site est à jour en 1 à 2 minutes

Les tests vérifient les calculs avant chaque mise en ligne. Si une modification casse quelque
chose, l'onglet **Actions** affiche une croix rouge et l'ancienne version reste en ligne.

## Infos de l'entreprise

**`src/config/entreprise.ts`** : téléphone, numéro WhatsApp, e-mail, horaires, **adresse du dépôt**
(sert à calculer les km d'approche) et **mentions légales** (numéro d'entreprise, adresse, TVA).
Les champs marqués `À COMPLÉTER` doivent être remplis avant de diffuser le site.

## Comment le prix est calculé

| Service | Formule |
|---|---|
| Livraison express | (prise en charge + km × prix/km) × taille, +25 % si départ immédiat |
| Marchandises | (prise en charge + km × prix/km) × chargement + étages sans ascenseur + 2e personne |
| Déménagement | heures × taux (chargement + temps de route) + km × prix/km (× allers-retours si plusieurs voyages) + étages × m³ |
| Camionnette + chauffeur | heures (minimum 2) × taux + km × prix/km |

Pour tous : les 15 premiers km entre le dépôt et le client sont offerts, au-delà ils sont facturés.
Majoration le dimanche. Un montant minimum s'applique par service.

## Technique

- React + TypeScript + Tailwind, construit avec Vite. En ligne sur ajsdelivery.be (one.com), copie sur GitHub Pages
- Adresses : [Photon](https://photon.komoot.io) — distances par la route : [OSRM](https://project-osrm.org)
  (données © OpenStreetMap, sans clé API). Si un service ne répond pas, la distance est estimée.
- Aucun cookie, aucune donnée stockée : la demande n'existe que dans le WhatsApp d'AJS.
- Le moteur de prix (`src/lib/devis.ts`) ne dépend pas du navigateur : il pourra servir tel quel
  à un bot WhatsApp.

```bash
npm install
npm run dev     # site en local
npm test        # tests des calculs
npm run build   # version de production dans dist/
```

## Visuels

- Logo (vectorisé depuis le logo officiel) : `src/assets/logo.svg`
- Photos des camionnettes détourées : `src/assets/vw.webp` et `src/assets/man.webp`
- Couleurs et polices : `tailwind.config.js` (orange `#FA5B07`, polices Archivo et JetBrains Mono)
- Carte de la zone : `src/components/carteDonnees.ts`, généré à partir de Natural Earth (domaine public)

## Prochaines étapes possibles

- Bot WhatsApp (API officielle Meta) qui utilise le même moteur de prix
- Enregistrement des demandes + tableau de bord des réservations
- Service d'itinéraires avec clé (OpenRouteService ou Google) si le volume augmente
