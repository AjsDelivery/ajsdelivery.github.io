/**
 * Adresses et distances, sans clé API :
 *  - Photon (komoot) pour l'autocomplétion et l'adresse depuis la position GPS
 *  - OSRM pour la distance réelle par la route
 *  - Repli à vol d'oiseau × 1,3 si un service ne répond pas
 * Données © OpenStreetMap contributors.
 */

export interface Lieu {
  label: string; // "Rue de la Station 12, 6000 Charleroi"
  ville: string;
  lat: number;
  lon: number;
  precision?: number; // mètres (position GPS)
}

const PHOTON = "https://photon.komoot.io";
const OSRM = "https://router.project-osrm.org";
// Benelux + nord de la France + ouest de l'Allemagne
const BBOX = "1.5,48.4,8.6,53.6";

interface PhotonFeature {
  geometry: { coordinates: [number, number] };
  properties: {
    name?: string;
    street?: string;
    housenumber?: string;
    postcode?: string;
    city?: string;
    district?: string;
    county?: string;
    country?: string;
    countrycode?: string;
    type?: string;
  };
}

function formatFeature(f: PhotonFeature): Lieu {
  const p = f.properties;
  const [lon, lat] = f.geometry.coordinates;
  const rue = p.street ? [p.street, p.housenumber].filter(Boolean).join(" ") : "";
  const ville = p.city || p.district || p.county || p.name || "";
  const premier = p.type === "city" || p.type === "district" ? "" : rue || (p.name !== ville ? p.name : "");
  const localite = [p.postcode, ville].filter(Boolean).join(" ");
  const pays = p.countrycode && p.countrycode !== "BE" ? p.country : "";
  const label = [premier, localite, pays].filter(Boolean).join(", ") || p.name || "Adresse";
  return { label, ville: ville || label, lat, lon };
}

export async function rechercherAdresses(q: string, pres?: { lat: number; lon: number }, signal?: AbortSignal): Promise<Lieu[]> {
  if (q.trim().length < 3) return [];
  const params = new URLSearchParams({ q, lang: "fr", limit: "6", bbox: BBOX });
  if (pres) {
    params.set("lat", String(pres.lat));
    params.set("lon", String(pres.lon));
  }
  const r = await fetch(`${PHOTON}/api/?${params}`, { signal });
  if (!r.ok) throw new Error("recherche indisponible");
  const data = (await r.json()) as { features: PhotonFeature[] };
  const vus = new Set<string>();
  return data.features.map(formatFeature).filter((l) => (vus.has(l.label) ? false : (vus.add(l.label), true)));
}

export async function adresseDepuisPosition(lat: number, lon: number): Promise<Lieu> {
  try {
    const r = await fetch(`${PHOTON}/reverse?lat=${lat}&lon=${lon}&lang=fr`);
    const data = (await r.json()) as { features: PhotonFeature[] };
    if (data.features?.[0]) return { ...formatFeature(data.features[0]), lat, lon };
  } catch {
    /* repli plus bas */
  }
  return { label: `Position GPS (${lat.toFixed(5)}, ${lon.toFixed(5)})`, ville: "Ma position", lat, lon };
}

export function maPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error("La localisation n'est pas disponible sur cet appareil."));
    navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 });
  });
}

/** Distance à vol d'oiseau en km */
export function volOiseau(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export interface Itineraire {
  kmApproche: number;
  kmTrajet: number;
  minutesTrajet: number;
  estimation: boolean; // true = repli vol d'oiseau
}

/** Dépôt → enlèvement → livraison, par la route */
export async function calculerItineraire(
  depot: { lat: number; lon: number },
  depart: { lat: number; lon: number },
  arrivee: { lat: number; lon: number },
  signal?: AbortSignal,
): Promise<Itineraire> {
  const pts = [depot, depart, arrivee].map((p) => `${p.lon},${p.lat}`).join(";");
  try {
    const r = await fetch(`${OSRM}/route/v1/driving/${pts}?overview=false`, { signal });
    if (!r.ok) throw new Error();
    const data = (await r.json()) as { code: string; routes: { legs: { distance: number; duration: number }[] }[] };
    if (data.code !== "Ok" || !data.routes?.[0]) throw new Error();
    const [l1, l2] = data.routes[0].legs;
    return {
      kmApproche: l1.distance / 1000,
      kmTrajet: l2.distance / 1000,
      minutesTrajet: Math.round(l2.duration / 60),
      estimation: false,
    };
  } catch (e) {
    if (signal?.aborted) throw e;
    const kmTrajet = volOiseau(depart, arrivee) * 1.3;
    return {
      kmApproche: volOiseau(depot, depart) * 1.3,
      kmTrajet,
      minutesTrajet: Math.round((kmTrajet / 70) * 60),
      estimation: true,
    };
  }
}

export const lienMaps = (l: { lat: number; lon: number }) =>
  `https://www.google.com/maps/search/?api=1&query=${l.lat.toFixed(6)},${l.lon.toFixed(6)}`;
export const lienWaze = (l: { lat: number; lon: number }) =>
  `https://waze.com/ul?ll=${l.lat.toFixed(6)},${l.lon.toFixed(6)}&navigate=yes`;
