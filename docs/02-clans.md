# Concrete Jungle — Les Clans (v0.1)

> Chaque clan = **1 Chef + 6 Membres**. Chacun a un **nom**, un **rôle** et un **pouvoir**.
> Deux types de pouvoirs :
> - **🟢 Passif / au déploiement** : s'applique quand on pose le pion (ou en continu).
> - **🔴 Action** : utilisable à ton tour comme action, même si le membre est déjà en jeu.
>
> Convention de coût : `(💵 n)` = coûte n Argent. `(🔥 n)` = génère n Chaleur dans le quartier concerné.

---

## 🇮🇹 1. La Mafia Italienne — *La vieille école* — **CLAN GABARIT**

> Identité : **l'honneur, la corruption et le contrôle dans la durée.** Forte sur les quartiers
> qu'elle tient, douée pour transformer la violence en argent et acheter la paix.

### 👑 Chef — Toto Regini, *Le Parrain*
- **Pouvoir (🟢 au déploiement + continu)** : *Respect.* Tant que le Parrain est en jeu, **tous tes
  membres dans son quartier gagnent +1 Influence**. Une fois par manche, en action :
  **Ordre du Parrain (🔴)** — déplace un de tes membres vers un quartier **adjacent** gratuitement.
- **Revers** : il vaut +1 Influence à lui seul mais **chaque coup bas subi** par les Italiens tant
  qu'il est en jeu fait monter la Chaleur de son quartier de +1 (il attire les ennuis).

### Les 6 membres

| # | Nom | Rôle | Pouvoir |
|---|-----|------|---------|
| 1 | **Massimo** | Le Chauffeur | **🔴 Action** : déplace **un de tes membres** d'un quartier vers un quartier **adjacent**. Mobilité et repositionnement de dernière minute. |
| 2 | **Carlo** | Le Nettoyeur *(le tueur)* | **🔴 Action (🔥 2)** : élimine **un membre adverse** d'un quartier où Carlo est présent → il part en Prison. Le coup fait grimper la Chaleur. |
| 3 | **Vincenzo** | Le Cuisinier | **🟢 Au déploiement** : gagne **3 💵**. **🔴 Action** : *blanchiment* — retire **1 🔥** de son quartier et gagne **1 💵**. Transforme la pression en cash. |
| 4 | **Salvatore** | Le Consigliere | **🔴 Action (💵 1)** : **corromps un Ripou** à prix réduit, **OU** annule l'effet de l'Événement de la manche pour ton clan. Le diplomate des coups tordus. |
| 5 | **Sofia** | La Veuve | **🟢 Au déploiement** : le quartier où elle est **ne peut plus subir de coup bas adverse** ce tour (intouchable). Protège tes positions clés. |
| 6 | **Bruno** | Le Soldat | **🟢 Au déploiement** : apporte **2 Influence** au lieu de 1. **🔴 Action (🔥 1)** : *intimidation* — un clan adverse de ton choix dans ce quartier **perd 1 Influence** ce tour. |

**Comment joue la Mafia Italienne ?** Tu poses tôt le Parrain + Bruno pour verrouiller un
quartier riche (Little Italy, Manhattan), tu génères du cash avec Vincenzo, tu protèges avec Sofia,
et tu nettoies les intrus avec Carlo — tout en gardant la Chaleur sous contrôle grâce au blanchiment
et aux Ripoux du Consigliere. Un clan **solide, équilibré, parfait pour apprendre le jeu**.

---

## Les 7 autres clans (identité + chef — pouvoirs à concevoir)

> Pour l'instant on fige **l'identité, le chef et la « patte »** de chaque clan. On détaillera les
> 6 membres de chacun une fois que tu auras validé ces directions (et qu'on aura playtesté la boucle).

### 🇲🇽 2. Les Cartels Mexicains — *La puissance de feu*
- **Patte de jeu** : agression et drogue. Beaucoup de Chaleur, gros revenus, frappes violentes.
  Le clan qui mise sur l'attaque et assume le risque police.
- **Chef (à nommer)** : *El Patrón* — pouvoir orienté « plus tu fais de bruit, plus tu gagnes ».

### ☘️ 3. Les Irlandais — *La débrouille des docks*
- **Patte de jeu** : flexibilité et liens avec la police locale. Doués pour **manipuler les Ripoux**
  et résister aux rafles. Maîtres de Hell's Kitchen.
- **Chef (à nommer)** : un vieux baron des docks.

### 🇯🇵 4. Les Yakuzas — *La discipline et le code*
- **Patte de jeu** : précision et efficacité. Peu de Chaleur, placements optimisés, pouvoirs
  « propres ». Le clan technique et chirurgical.
- **Chef (à nommer)** : l'Oyabun.

### 🏙️ 5. Les Gangs des Ghettos — *Le nombre et la rue*
- **Patte de jeu** : la masse. Plus de pions / recrutement rapide, contrôle par le nombre,
  fort dans le Bronx et Harlem. Submerge l'adversaire.
- **Chef (à nommer)** : le caïd du quartier.

### 🇷🇺 6. La Mafia Russe — *La brutalité froide*
- **Patte de jeu** : marché noir et coups durs sans état d'âme. Doués pour **ignorer la Chaleur**
  et frapper fort. Le rouleau compresseur.
- **Chef (à nommer)** : le *Vor* (parrain russe).

### 🇨🇳 7. Les Triades Chinoises — *Le réseau et le secret*
- **Patte de jeu** : information, argent et discrétion. Pouvoirs cachés/différés, manipulation
  de l'Influence à distance. Le clan le plus subtil. Reine de Chinatown.
- **Chef (à nommer)** : le *Dragon Head* (Shan Chu).

### 🇦🇱 8. Les Albanais — *Les nouveaux venus* — **(8ᵉ clan choisi)**
- **Patte de jeu** : agressifs, sans peur, opportunistes. Volent les positions des autres,
  montent vite, n'ont rien à perdre. Le clan « casse-cou » à fort tempo.
- **Chef (à nommer)** : un jeune chef impitoyable.

---

## Tableau de synthèse des « pattes » (pour l'asymétrie)

| Clan | Force principale | Faiblesse / risque | Style |
|------|------------------|--------------------|-------|
| Italiens 🇮🇹 | Contrôle durable + cash | Le Parrain attire la Chaleur | Équilibré |
| Cartels 🇲🇽 | Frappe + gros revenus | Énormément de Chaleur | Agressif |
| Irlandais ☘️ | Maîtrise de la police | Moins de puissance brute | Malin |
| Yakuzas 🇯🇵 | Précision, peu de Chaleur | Peu de « masse » | Technique |
| Ghettos 🏙️ | Le nombre | Pions faibles individuellement | Submersion |
| Russes 🇷🇺 | Ignore la Chaleur, frappe fort | Peu de finesse | Bourrin |
| Triades 🇨🇳 | Réseau, info, argent | Fragile en début de partie | Subtil |
| Albanais 🇦🇱 | Tempo, vol de positions | Peu de défense | Casse-cou |

---

## Prochaine étape de conception

1. Valider les **8 « pattes »** ci-dessus (ou ajuster).
2. **Nommer les chefs** restants et leurs 6 membres (sur le modèle des Italiens).
3. Définir les **pouvoirs** un clan à la fois, en gardant l'équilibre du tableau.
