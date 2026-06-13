# Concrete Jungle — Règles du jeu (squelette v0.1)

> Document de travail. Tous les chiffres (valeurs, seuils, PV) sont des **valeurs de départ**
> à confirmer au playtest. L'objectif de cette v0.1 est de figer la **boucle de jeu**.

---

## 1. But du jeu

Devenir le **maître de New York** en accumulant le plus de **Points de Réputation (PR)**
au bout de **4 manches**. On gagne des PR surtout en **contrôlant des quartiers**.

---

## 2. Matériel (prévisionnel)

- **1 plateau** de New York divisé en **9 quartiers** reliés par des routes.
- **8 clans**, chacun avec :
  - 1 carte **Chef** + 6 cartes **Membres** (rôles + pouvoirs).
  - 7 **pions personnage** à la couleur du clan (1 chef + 6 membres).
  - 1 **plateau de clan** (réserve, argent, repaire).
- **Jetons Chaleur** (🔥) — la pression policière.
- **Jetons Argent** (💵).
- **Marqueurs d'Influence** (si besoin de cubes en plus des pions).
- **1 deck Événements**.
- **Pions Police** + cartes **Ripoux** + carte **Procureur**.
- **1 piste de score** (Réputation).
- **Matériel solo** : deck **Automa** + piste de **Pression police**.

### Les 9 quartiers (proposition)

| # | Quartier | Valeur (PR/manche) | Emplacements | Note |
|---|----------|:---:|:---:|------|
| 1 | Little Italy | 2 | 3 | Berceau de la mafia |
| 2 | Chinatown | 2 | 3 | |
| 3 | Lower East Side | 2 | 3 | |
| 4 | Hell's Kitchen | 3 | 4 | |
| 5 | Harlem | 2 | 3 | |
| 6 | The Bronx | 2 | 4 | Grand, populeux |
| 7 | Brooklyn | 3 | 4 | |
| 8 | Queens | 2 | 3 | |
| 9 | **Manhattan / Downtown** | **4** | 4 | Le joyau, le plus disputé |

> Les « emplacements » limitent combien de pions tiennent dans un quartier (toutes
> couleurs confondues), ce qui crée la tension de placement.

---

## 3. Les ressources

### Influence
C'est ce qui décide **qui contrôle** un quartier. Chaque pion placé apporte de l'**Influence**
dans son quartier (par défaut **1**, certains membres apportent plus ou en retirent aux autres).
En fin de manche, le clan avec **le plus d'Influence** dans un quartier le **contrôle**.

### Argent (💵)
Sert à : activer certains pouvoirs, **corrompre** un flic/ripoux, soudoyer le Procureur,
recruter, et compte un peu en fin de partie. On en gagne via les quartiers contrôlés et
certains membres (le Cuisinier, etc.).

### Chaleur (🔥)
Mesure l'attention de la police **par quartier**. Les actions **violentes** (éliminer/déplacer
de force un pion adverse) ajoutent de la Chaleur. Trop de Chaleur → **rafle** (voir §6).

---

## 4. Mise en place

1. Place le plateau. Pose la valeur de chaque quartier.
2. Chaque joueur prend un clan : plateau de clan, 7 pions, cartes Chef + 6 Membres.
3. Revenu de départ : **3 💵** par joueur.
4. **Déploiement initial** : en ordre du tour, chaque joueur place **1 membre** (pas le chef)
   sur un quartier de son choix. (À 2 joueurs, on en place 2 chacun.)
5. Mélange le deck Événements. Place les pions Police de côté, la carte Procureur au centre.
6. Le **premier joueur** est le dernier à avoir commis un crime dans la vraie vie *(ou au hasard)*.

---

## 5. Déroulement d'une manche

Une partie = **4 manches**. Chaque manche suit 4 phases.

### Phase A — Événement
Révèle la carte **Événement** du dessus. Elle modifie la manche en cours
(bonus sur un quartier, rafle anticipée, prix de la corruption, etc.). C'est la **petite dose
de hasard** qui rebat les priorités sans casser la stratégie.

### Phase B — Placement (le cœur du jeu)
En commençant par le premier joueur et **dans le sens horaire**, chacun à son tour effectue
**UNE action** parmi :

- **Déployer un membre** : prends un personnage de ta réserve, place-le sur un quartier
  ayant un emplacement libre, puis **active son pouvoir** (facultatif).
- **Activer un pouvoir** d'un de tes membres **déjà en jeu** (ceux marqués « action »).
- **Passer** : tu ne joues plus de la manche (tu peux passer tôt pour garder des hommes en réserve).

On continue de faire le tour jusqu'à ce que **tous les joueurs aient passé**.

> Le **Chef** peut être déployé comme un membre. Il est très puissant mais devient une **cible
> prioritaire** : tant qu'il est en jeu, il vaut de l'Influence en plus mais attire la Chaleur.

### Phase C — Police & Chaleur
Pour chaque quartier dont la Chaleur **atteint le seuil de rafle** (par défaut **3 🔥**) :
1. La **Police** débarque. Le clan ayant **le plus de pions** dans ce quartier perd **1 membre**
   (renvoyé dans une zone « Prison », indisponible la manche suivante). Égalité → chaque clan
   à égalité perd 1 membre.
2. Retire **2 🔥** du quartier (la pression retombe un peu).
3. Un joueur peut **payer un Ripou** (💵) *avant* la rafle pour **annuler** la descente dans un quartier.

### Phase D — Contrôle & Revenus
Pour chaque quartier :
1. Le clan avec **le plus d'Influence** le **contrôle** : il gagne sa **valeur en PR** + son **revenu en 💵**.
2. **Égalité** → quartier **« contesté »** : personne ne marque, mais la Chaleur y monte de **+1** pour
   la manche suivante (la guerre s'enlise).

Puis : libère les membres de Prison vers la réserve, défausse l'Événement, le marqueur premier
joueur passe à gauche. **Les pions restent en place d'une manche à l'autre** (le terrain se conquiert
dans la durée) — sauf indication d'un pouvoir ou d'un événement.

---

## 6. Fin de partie & vainqueur

Après la **Phase D de la 4ᵉ manche** :
- +1 PR par tranche de **3 💵** restants.
- +2 PR au clan contrôlant **Manhattan / Downtown** (bonus du joyau).
- Le clan avec le plus de **PR** est le **maître de la Concrete Jungle**.
- Égalité → départage par le nombre de **quartiers contrôlés**, puis par l'**argent**.

---

## 7. La Police, les Ripoux & le Procureur (résumé)

- **Police (pions)** : neutre, frappe les quartiers chauds en Phase C.
- **Ripoux (cartes)** : achetables (💵). Effet ponctuel : annuler une rafle, baisser la Chaleur d'un
  quartier, « regarder ailleurs » pendant un coup bas. Une fois utilisé → défaussé/épuisé.
- **Procureur douteux (carte centrale)** : un seul exemplaire partagé. Le joueur qui le **soudoie**
  (enchère en 💵 à un moment-clé) peut **envoyer un membre adverse en Prison** sans générer de Chaleur.
  Mais il change de camp : le prochain qui paie plus cher le récupère. Outil de coup bas « propre ».

---

## 8. Mode solo (1 joueur) — esquisse

Tu joues contre **La Pègre**, un clan rival géré par un **deck Automa**, sous une **pression
policière qui monte toute seule**.

- À chaque manche, révèle une carte Automa qui dit **où** La Pègre déploie et **quel coup bas**
  elle tente (règles déterministes, pas de décision).
- Une **piste de Pression** monte de +1 par manche (et plus vite si tu fais des coups violents).
  Au max → rafle automatique sur **ton** quartier le plus chaud.
- **Objectif** : à la fin des 4 manches, avoir **plus de PR que La Pègre** ET contrôler au moins
  **3 quartiers**. Sinon la ville te dévore.
- Niveaux de difficulté : nombre de membres de départ de La Pègre + vitesse de la Pression.

> Détail complet de l'Automa à concevoir une fois les 8 clans et le deck Événements figés.

---

## 9. Pourquoi ça coche le cahier des charges

- **Fluide & rapide** : un tour = une action simple. Peu de temps mort.
- **Interaction & coups bas** : pouvoirs offensifs (tueur, chauffeur, intimidation), Procureur, Ripoux.
- **Un peu de hasard** : deck Événements, sans dés à chaque action.
- **Stratégie** : gestion Influence / Argent / Chaleur, choix de quand sortir le Chef, bluff sur le passage.
- **Rejouabilité** : 8 clans asymétriques + événements + plateau modulable.
- **1 à 6 joueurs** : multi par majorités, solo par Automa.

---

## 10. Points ouverts (à trancher au fil du design)

- [ ] Nombre exact de quartiers (9 ?) et leurs valeurs/emplacements.
- [ ] Seuil de rafle (3 🔥 ?) et coût des Ripoux.
- [ ] Le Chef : déployable librement ou contraintes spéciales ?
- [ ] Faut-il des **cubes d'Influence** distincts des pions, ou l'Influence = nombre de pions ?
- [ ] Recrutement de membres en cours de partie : oui/non ?
- [ ] Variante « 5-6 joueurs » : plateau plus grand ou équipes ?
