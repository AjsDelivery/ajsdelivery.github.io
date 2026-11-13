/**
 * La zone de couverture, comme dans la vidéo : la Belgique en points orange,
 * les pays voisins en points gris, et les trajets qui partent de Binche
 * se dessinent quand la carte entre à l'écran.
 */
import { CARTE, PAYS, VILLES } from "./carteDonnees";

const ETRANGER = ["Paris", "Lille", "Amsterdam", "Cologne", "Luxembourg"] as const;
const BELGIQUE = ["Bruxelles", "Anvers", "Gand", "Liège", "Namur"] as const;

/** Arc entre deux points, bombé sur le côté */
function arc([x1, y1]: [number, number], [x2, y2]: [number, number], bombe = 0.22) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  return `M${x1} ${y1}Q${(mx - dy * bombe).toFixed(1)} ${(my + dx * bombe).toFixed(1)} ${x2} ${y2}`;
}

const POSITION_ETIQUETTE: Record<string, { dx: number; dy: number; ancre: "start" | "end" | "middle" }> = {
  Paris: { dx: 12, dy: 5, ancre: "start" },
  Lille: { dx: -12, dy: 5, ancre: "end" },
  Amsterdam: { dx: 12, dy: 5, ancre: "start" },
  Cologne: { dx: 0, dy: -14, ancre: "middle" },
  Luxembourg: { dx: 12, dy: 18, ancre: "start" },
};

export default function Carte() {
  const depart = VILLES.Binche;
  return (
    <svg
      viewBox={`0 0 ${CARTE.largeur} ${CARTE.hauteur}`}
      className="h-auto w-full"
      role="img"
      aria-label="Carte : départ de Binche, livraisons dans toute la Belgique et vers Paris, Lille, Amsterdam, Cologne et Luxembourg"
    >
      <defs>
        <pattern id="pts-be" width="9" height="9" patternUnits="userSpaceOnUse">
          <circle cx="4.5" cy="4.5" r="2.1" fill="#FA5B07" />
        </pattern>
        <pattern id="pts-voisins" width="9" height="9" patternUnits="userSpaceOnUse">
          <circle cx="4.5" cy="4.5" r="1.3" fill="#4d4d4d" />
        </pattern>
        <filter id="lueur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {(["FR", "NL", "LU", "DE"] as const).map((k) => (
        <path key={k} d={PAYS[k]} fill="url(#pts-voisins)" />
      ))}
      <path d={PAYS.BE} fill="url(#pts-be)" opacity="0.8" />
      <path d={PAYS.BE} fill="none" stroke="#FA5B07" strokeOpacity="0.45" strokeWidth="1.2" />

      {/* trajets intérieurs */}
      {BELGIQUE.map((v, i) => (
        <path
          key={v}
          d={arc(depart, VILLES[v], 0.12)}
          pathLength={1}
          className="trajet"
          style={{ ["--l" as string]: 1, transitionDelay: `${200 + i * 90}ms` }}
          fill="none"
          stroke="#FFB27F"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      ))}
      {/* trajets vers l'étranger */}
      {ETRANGER.map((v, i) => (
        <path
          key={v}
          d={arc(depart, VILLES[v])}
          pathLength={1}
          className="trajet"
          style={{ ["--l" as string]: 1, transitionDelay: `${600 + i * 140}ms` }}
          fill="none"
          stroke="#FA5B07"
          strokeWidth="2.6"
          strokeLinecap="round"
          filter="url(#lueur)"
        />
      ))}

      {/* villes */}
      {[...BELGIQUE, ...ETRANGER].map((v, i) => {
        const [x, y] = VILLES[v];
        const etranger = (ETRANGER as readonly string[]).includes(v);
        const pos = POSITION_ETIQUETTE[v];
        return (
          <g key={v} className="ville" style={{ transitionDelay: `${900 + i * 80}ms` }}>
            <circle cx={x} cy={y} r={etranger ? 5 : 3.5} fill="#F3F2EF" />
            {etranger && pos && (
              <text
                x={x + pos.dx}
                y={y + pos.dy}
                textAnchor={pos.ancre}
                className="fill-brume font-mono"
                fontSize="17"
                letterSpacing="2"
              >
                {v.toUpperCase()}
              </text>
            )}
          </g>
        );
      })}
      {/* Bruxelles, repère */}
      <text x={VILLES.Bruxelles[0] + 10} y={VILLES.Bruxelles[1] - 8} className="ville fill-craie font-mono" fontSize="15" letterSpacing="1.5">
        BRUXELLES
      </text>

      {/* départ */}
      <circle cx={depart[0]} cy={depart[1]} r="7" fill="#FA5B07" className="ping" />
      <circle cx={depart[0]} cy={depart[1]} r="7" fill="#FA5B07" stroke="#121212" strokeWidth="2.5" />
      <text x={depart[0] + 6} y={depart[1] + 46} textAnchor="end" className="fill-orange font-mono" fontSize="17" letterSpacing="2">
        BINCHE
      </text>
    </svg>
  );
}
