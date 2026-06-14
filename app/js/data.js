// Concrete Jungle — données du jeu (v0.2 : rosters asymétriques)
// Chaque clan a ses 7 personnages uniques (rôle + pouvoir propres).

const DISTRICTS = [
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
function computeAdjacency() {
  for (const d of DISTRICTS) {
    d.adj = DISTRICTS.filter(o => o.id !== d.id &&
      ((o.col === d.col && Math.abs(o.row - d.row) === 1) ||
       (o.row === d.row && Math.abs(o.col - d.col) === 1))
    ).map(o => o.id);
  }
}
computeAdjacency();

// m(code,name,role,inf,icon,power,desc) — fabrique un membre
function m(code, name, role, inf, icon, power, desc) {
  return { code, name, role, inf, icon, power, desc };
}

const CLANS = [
  { id: "ita", name: "Mafia Italienne", emoji: "🇮🇹", color: "#c79a2e", members: [
    m("chef","Toto Regini","Le Parrain",2,"♛","aura","+1 influence à tes pions de ce quartier (aura du chef)."),
    m("consigliere","Salvatore","Le Consigliere",1,"🎩","cool2","Corruption : -2 chaleur dans ce quartier."),
    m("capo","Bruno","Le Capo",2,"🥊","intimidate","Vaut 2 d'influence ; un rival du quartier perd 1 influence."),
    m("sicario","Carlo","Le Sicario",1,"🔪","kill2","Élimine un pion adverse du quartier (+2 chaleur)."),
    m("resto","Vincenzo","Le Ristorante",1,"🍝","money3cool","+3 argent et -1 chaleur (blanchiment)."),
    m("vedova","Sofia","La Vedova",1,"🕸️","protect","Ce quartier devient intouchable ce tour."),
    m("faussaire","Aldo","Le Faussaire",1,"💵","dbl","+2 argent ; son influence est doublée si tu as ≥5 argent."),
  ]},
  { id: "mex", name: "Cartels Mexicains", emoji: "🇲🇽", color: "#d35400", members: [
    m("chef","Diego Salazar","El Patrón",2,"🌵","aura_earn","+1 influence aux alliés ; +1 argent à chaque coup violent de ton clan."),
    m("pistolero","Rafael","El Pistolero",1,"🔫","kill_panic","Élimine un pion adverse (+2 chaleur) ; un autre rival perd 1 influence."),
    m("quimica","Lucía","La Química",1,"⚗️","money4heat","+4 argent (laboratoire), mais +1 chaleur."),
    m("mula","Mateo","La Mula",1,"🚚","move","Contrebande : rapatrie un de tes pions vers ce quartier."),
    m("halcon","Tomás","El Halcón",1,"🦅","antiraid","Le guet : annule la prochaine rafle dans ce quartier."),
    m("abogado","Hector","El Abogado",1,"⚖️","cool3","Corruption : -3 chaleur dans ce quartier."),
    m("reina","Carmen","La Reina",2,"👑","protect","Protège ce quartier et vaut 2 d'influence."),
  ]},
  { id: "irl", name: "Les Irlandais", emoji: "☘️", color: "#1e8449", members: [
    m("chef","Seamus O'Connell","Le Boss",2,"☘️","aura","+1 influence à tes pions de ce quartier."),
    m("docker","Big Paddy","Le Docker",2,"⚓","income","Vaut 2 d'influence ; +1 argent quand tu contrôles ce quartier."),
    m("faucheur","Liam","Le Faucheur",1,"💀","kill2","Élimine un pion adverse (+2 chaleur)."),
    m("ripou","Sean Kelly","Le Flic ripou",1,"🚔","police","Annule la rafle à venir sur ton quartier le plus chaud."),
    m("barman","Brennan","Le Barman",1,"🍺","money2","+2 argent (la caisse du bar)."),
    m("cure","Father Doyle","Le Curé corrompu",1,"✝️","protect","Bénédiction : ce quartier est intouchable ce tour."),
    m("matriarche","Maureen","La Matriarche",1,"🧣","protect","Ce quartier devient intouchable ce tour."),
  ]},
  { id: "yak", name: "Les Yakuzas", emoji: "🇯🇵", color: "#34495e", members: [
    m("chef","Takeshi","L'Oyabun",2,"🎌","aura_disc","+1 influence ; discipline : tes coups ne génèrent plus de chaleur ce tour."),
    m("sabreur","Kenji","Le Sabreur",1,"⚔️","kill1","Élimine un pion adverse proprement (+1 chaleur)."),
    m("tatoueur","Hideo","Le Tatoueur",1,"🖋️","buff","Marque un de tes membres : +1 influence permanente (irezumi)."),
    m("comptable","Kenta","Le Comptable",1,"🧮","money3cool","+3 argent et -1 chaleur."),
    m("kage","Ryo","Le Kage",1,"🌑","shield","Neutralise le prochain coup bas visant ton clan."),
    m("garde","Goro","Le Garde du corps",2,"🛡️","protect","Protège ce quartier et vaut 2 d'influence."),
    m("negociateur","Saito","Le Négociateur",1,"🕊️","cool2","Réduit la chaleur (-2) et calme le jeu."),
  ]},
  { id: "ght", name: "Gangs des Ghettos", emoji: "🏙️", color: "#8e44ad", members: [
    m("chef","Big T","Le Caïd",2,"👑","aura_swarm","+1 influence ; +1 bonus si tu as ≥3 pions sur le plateau."),
    m("rappeur","Blaze","Le Rappeur",1,"🎤","hype","Le clout : +1 influence à tous tes pions de ce quartier."),
    m("taggeur","Rebel","Le Taggeur",1,"🎨","tag","Graffe un quartier adjacent : +1 d'influence à distance."),
    m("guetteur","Eyez","Le Guetteur",1,"👀","antiraid","Prévient la descente : annule la rafle dans ce quartier."),
    m("shooter","Ghost","Le Shooter",1,"🔫","kill2","Élimine un pion adverse (+2 chaleur)."),
    m("dealer","Cash","Le Dealer",1,"💊","money3","+3 argent (deal de rue)."),
    m("tante","Auntie","La Tante",1,"🧺","protect","Ce quartier devient intouchable ce tour."),
  ]},
  { id: "rus", name: "Mafia Russe", emoji: "🇷🇺", color: "#2980b9", members: [
    m("chef","Dimitri","Le Vor",2,"⭐","aura_cold","+1 influence ; sang-froid : le chef ignore la 1ʳᵉ rafle qui le vise."),
    m("boucher","Viktor","Le Boucher",1,"🔪","kill2","Élimine un pion adverse (+2 chaleur)."),
    m("spetsnaz","Sergei","L'Ex-Spetsnaz",3,"🪖","heat1","Vaut 3 d'influence (force militaire), mais +1 chaleur."),
    m("armurier","Igor","Le Marchand d'armes",1,"🔫","money4","Marché noir : +4 argent."),
    m("hacker","Maxim","Le Hacker",1,"💻","heatrival","Manipule la police : +2 chaleur sur le quartier d'un rival."),
    m("espionne","Natasha","L'Espionne",1,"🕵️","steal","Vole 2 argent à l'adversaire le plus riche."),
    m("brigadier","Grigori","Le Brigadier",2,"🐻","protect_intim","Protège ce quartier, vaut 2 d'influence, intimide (-1 à un rival)."),
  ]},
  { id: "tri", name: "Triades Chinoises", emoji: "🇨🇳", color: "#c0392b", members: [
    m("chef","Wong","Le Dragon Head",2,"🐉","aura","+1 influence à tes pions de ce quartier."),
    m("batonrouge","Feng","Le Bâton Rouge (426)",2,"🔴","intimidate","Vaut 2 d'influence ; un rival du quartier perd 1 influence."),
    m("eventail","Bao","L'Éventail Blanc (438)",1,"⚪","money_scale","+1 argent par quartier que tu contrôles (le financier)."),
    m("sandale","Tao","La Sandale de Paille (432)",1,"🥿","move","Liaison : rapatrie un de tes pions vers ce quartier."),
    m("ombre","Chen","L'Ombre",1,"🌑","kill1","Élimine un pion adverse discrètement (+1 chaleur)."),
    m("jeu","Kwan","Le Maître du Jeu",1,"🎲","money3","Tripot : +3 argent."),
    m("gardienne","Lin","La Gardienne",1,"🏮","protect","Ce quartier devient intouchable ce tour."),
  ]},
  { id: "alb", name: "Les Albanais", emoji: "🇦🇱", color: "#111111", members: [
    m("chef","Besnik","Le Krye",2,"🦅","aura","+1 influence à tes pions de ce quartier (besa)."),
    m("loup","Lëku","Le Loup",1,"🐺","kill2","Élimine un pion adverse (+2 chaleur), féroce."),
    m("cousin","Gjon","Le Cousin",1,"👥","free","La famille s'agrandit : déploie un 2ᵉ membre gratuitement ce tour."),
    m("passeur","Endrit","Le Passeur",1,"📦","move","Contrebande : rapatrie un de tes pions vers ce quartier (+1 argent)."),
    m("besa","Agim","Le Gardien de la Besa",1,"🤝","protect","Protège ce quartier (aucun coup bas, aucun vol) ce tour."),
    m("brasdroit","Arben","Le Bras droit",2,"✊","tiewin","Vaut 2 d'influence ; tu gagnes les égalités dans ce quartier."),
    m("fixeur","Fatos","Le Fixeur",1,"💼","cool2","Corrompt la police : -2 chaleur dans ce quartier."),
  ]},
];

const CONFIG = {
  rounds: 4, startMoney: 3, raidThreshold: 3, raidHeatRelief: 2,
  killHeat: 2, jewelBonus: 2, moneyPerPR: 3,
};

window.CJ_DATA = { DISTRICTS, CLANS, CONFIG };
