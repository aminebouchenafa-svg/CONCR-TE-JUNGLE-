// Concrete Jungle — données du jeu (quartiers + clans)
// Tout est exposé sur window.CJ_DATA pour rester simple (pas de bundler).

const DISTRICTS = [
  // grid 3x3 ; col/row servent au layout ; adj calculée par voisinage orthogonal
  { id: 0, name: "The Bronx",        value: 2, revenue: 1, slots: 4, col: 0, row: 0 },
  { id: 1, name: "Harlem",           value: 2, revenue: 1, slots: 3, col: 1, row: 0 },
  { id: 2, name: "Queens",           value: 2, revenue: 1, slots: 3, col: 2, row: 0 },
  { id: 3, name: "Hell's Kitchen",   value: 3, revenue: 2, slots: 4, col: 0, row: 1 },
  { id: 4, name: "Manhattan",        value: 4, revenue: 3, slots: 4, col: 1, row: 1, jewel: true },
  { id: 5, name: "Brooklyn",         value: 3, revenue: 2, slots: 4, col: 2, row: 1 },
  { id: 6, name: "Little Italy",     value: 2, revenue: 1, slots: 3, col: 0, row: 2 },
  { id: 7, name: "Chinatown",        value: 2, revenue: 1, slots: 3, col: 1, row: 2 },
  { id: 8, name: "Lower East Side",  value: 2, revenue: 1, slots: 3, col: 2, row: 2 },
];

// adjacence orthogonale sur la grille
function computeAdjacency() {
  for (const d of DISTRICTS) {
    d.adj = DISTRICTS.filter(o => o.id !== d.id &&
      ((o.col === d.col && Math.abs(o.row - d.row) === 1) ||
       (o.row === d.row && Math.abs(o.col - d.col) === 1))
    ).map(o => o.id);
  }
}
computeAdjacency();

// Rôles partagés (archétypes) — l'asymétrie fine viendra plus tard, clan par clan.
// influence = influence apportée par le pion. power = identifiant de pouvoir au déploiement.
const ROLES = {
  chef:       { key: "chef",       label: "Chef",        influence: 2, icon: "♛",
                desc: "Aura : +1 influence à chacun de tes pions dans son quartier." },
  soldat:     { key: "soldat",     label: "Soldat",      influence: 2, icon: "▲",
                desc: "Une force brute : vaut 2 d'influence." },
  tueur:      { key: "tueur",      label: "Tueur",       influence: 1, icon: "✖",
                desc: "Au déploiement : élimine un pion adverse de ce quartier (+2 chaleur)." },
  chauffeur:  { key: "chauffeur",  label: "Chauffeur",   influence: 1, icon: "→",
                desc: "Au déploiement : rapatrie un de tes pions d'un autre quartier vers celui-ci." },
  cuisinier:  { key: "cuisinier",  label: "Cuisinier",   influence: 1, icon: "$",
                desc: "Au déploiement : +3 argent et -1 chaleur dans ce quartier." },
  corrupteur: { key: "corrupteur", label: "Corrupteur",  influence: 1, icon: "§",
                desc: "Au déploiement : -2 chaleur dans ce quartier (corruption)." },
  protecteur: { key: "protecteur", label: "Protecteur",  influence: 1, icon: "◆",
                desc: "Au déploiement : ce quartier est intouchable (aucun coup bas) ce tour." },
};

// L'ordre des membres dans chaque clan (toujours les 7 mêmes archétypes pour la v0.1).
const ROLE_ORDER = ["chef", "soldat", "tueur", "chauffeur", "cuisinier", "corrupteur", "protecteur"];

// 8 clans : nom, couleur, emoji, et noms personnalisés par rôle.
const CLANS = [
  { id: "ita", name: "Mafia Italienne", emoji: "🇮🇹", color: "#c79a2e",
    names: { chef:"Toto Regini", soldat:"Bruno", tueur:"Carlo", chauffeur:"Massimo",
             cuisinier:"Vincenzo", corrupteur:"Salvatore", protecteur:"Sofia" } },
  { id: "mex", name: "Cartels Mexicains", emoji: "🇲🇽", color: "#d35400",
    names: { chef:"El Patrón", soldat:"El Toro", tueur:"La Sombra", chauffeur:"El Rápido",
             cuisinier:"La Cocinera", corrupteur:"El Abogado", protecteur:"La Madre" } },
  { id: "irl", name: "Les Irlandais", emoji: "☘️", color: "#1e8449",
    names: { chef:"Seamus O'Connell", soldat:"Big Paddy", tueur:"Liam le Faucheur", chauffeur:"Quick Mick",
             cuisinier:"Brennan", corrupteur:"Father Doyle", protecteur:"Maureen" } },
  { id: "yak", name: "Les Yakuzas", emoji: "🇯🇵", color: "#34495e",
    names: { chef:"Oyabun Takeshi", soldat:"Goro", tueur:"Kenji la Lame", chauffeur:"Haru",
             cuisinier:"Yuki", corrupteur:"Saito", protecteur:"Aiko" } },
  { id: "ght", name: "Gangs des Ghettos", emoji: "🏙️", color: "#8e44ad",
    names: { chef:"Big T", soldat:"Tank", tueur:"Ghost", chauffeur:"Flash",
             cuisinier:"Mama J", corrupteur:"Slick", protecteur:"Auntie" } },
  { id: "rus", name: "Mafia Russe", emoji: "🇷🇺", color: "#2980b9",
    names: { chef:"Vor Dimitri", soldat:"Boris", tueur:"Viktor le Boucher", chauffeur:"Yuri",
             cuisinier:"Anya", corrupteur:"Pavel", protecteur:"Natasha" } },
  { id: "tri", name: "Triades Chinoises", emoji: "🇨🇳", color: "#c0392b",
    names: { chef:"Shan Chu Wong", soldat:"Jin", tueur:"Chen l'Ombre", chauffeur:"Lao",
             cuisinier:"Mei", corrupteur:"Hu", protecteur:"Lin" } },
  { id: "alb", name: "Les Albanais", emoji: "🇦🇱", color: "#111111",
    names: { chef:"Besnik", soldat:"Gjergj", tueur:"Lëku le Loup", chauffeur:"Ardit",
             cuisinier:"Drita", corrupteur:"Fatos", protecteur:"Mira" } },
];

const CONFIG = {
  rounds: 4,
  startMoney: 3,
  raidThreshold: 3,   // chaleur déclenchant une rafle
  raidHeatRelief: 2,  // chaleur retirée après une rafle
  killHeat: 2,        // chaleur générée par un meurtre
  jewelBonus: 2,      // PR bonus de fin pour le contrôleur de Manhattan
  moneyPerPR: 3,      // argent restant -> PR en fin de partie
};

window.CJ_DATA = { DISTRICTS, ROLES, ROLE_ORDER, CLANS, CONFIG };
