# 🏙️ CONCRETE JUNGLE

> *New York. Huit clans. Une seule ville à conquérir.*

**Concrete Jungle** est un jeu de société de **guerre de territoires** où des clans criminels
s'affrontent pour devenir les **maîtres de New York**. Chaque quartier appartient à quelqu'un —
à toi de le lui prendre, par l'influence, l'argent… ou la violence. Mais attention : plus tu fais
de bruit, plus la **police** s'intéresse à toi.

## En un coup d'œil

| | |
|---|---|
| **Joueurs** | 1 à 6 |
| **Durée** | 30 à 60 min |
| **Mécanique** | Placement de personnages + Contrôle de territoire (majorités) |
| **Tonalité** | Stratégie, interaction forte, coups bas, un soupçon de hasard |
| **Âge** | 14+ |

## Le pitch

Tu diriges l'un des huit clans qui se partagent la ville. Chaque clan a un **chef** et **six membres**,
chacun avec un **rôle** et un **pouvoir unique**. Tu déploies tes hommes sur les quartiers de NYC pour
y imposer ton influence. À la fin de chaque manche, celui qui **domine** un quartier l'empoche.

Mais ce n'est pas si simple : ton tueur peut faire disparaître un rival, ton chauffeur déplacer tes
hommes en un éclair, ton consigliere acheter un flic… Chaque coup violent fait monter la **chaleur**,
et quand la police débarque, ce sont tes hommes qui finissent au poste.

Après quatre manches, le clan qui contrôle le plus la ville devient le **maître de la Concrete Jungle**.

## Les 8 clans

1. 🇮🇹 **La Mafia Italienne** — la vieille école, l'honneur et la corruption *(chef : Toto Regini, le Parrain)*
2. 🇲🇽 **Les Cartels Mexicains** — la puissance de feu et la drogue
3. ☘️ **Les Irlandais** — la débrouille, les docks et les flics du quartier
4. 🇯🇵 **Les Yakuzas** — la discipline, le code et la précision
5. 🏙️ **Les Gangs des Ghettos** — le nombre, le terrain et la rue
6. 🇷🇺 **La Mafia Russe** — la brutalité froide et le marché noir
7. 🇨🇳 **Les Triades Chinoises** — le réseau, le secret et l'argent
8. 🇦🇱 **Les Albanais** — les nouveaux venus, brutaux et sans peur *(8ᵉ clan choisi)*

## La menace commune

- 👮 **La Police** — traque les clans, déclenche des rafles dans les quartiers « chauds ».
- 🚨 **Les Ripoux** — des flics corrompus que tu peux acheter pour fermer les yeux.
- ⚖️ **Le Procureur douteux** — il peut faire tomber un rival… ou se laisser convaincre.

## 📱 L'application (iPhone / iPad)

Le jeu existe déjà en **prototype jouable** : une application web (PWA) pensée
**mobile-first**, qui tourne dans Safari sur iPhone et iPad et s'installe sur
l'écran d'accueil (plein écran, hors-ligne, icône).

- **Modes** : Pass & play (2 à 6 joueurs sur le même appareil) et Solo contre l'automa « La Pègre ».
- **Le code** est dans [`app/`](app/) — pas de build, pas de dépendance.

### Lancer l'app en local
```bash
cd app
python3 -m http.server 8000   # ou : npx serve
# puis ouvrir http://localhost:8000 sur le téléphone (même réseau Wi-Fi)
```

### L'installer sur iPhone / iPad
Ouvre l'URL dans **Safari** → bouton **Partager** → **Sur l'écran d'accueil**.
L'app se lance ensuite en plein écran comme une vraie application.

> Plus tard, pour une publication sur l'App Store, on emballera cette même base
> dans une coque native (Capacitor) sans tout réécrire.

## État du projet

🚧 **En conception — prototype jouable disponible.**

- [x] Choix de la mécanique (hybride territoire + placement)
- [x] Choix du 8ᵉ clan (Albanais)
- [x] Squelette des règles — voir [`docs/01-regles.md`](docs/01-regles.md)
- [x] Clan gabarit : Mafia Italienne — voir [`docs/02-clans.md`](docs/02-clans.md)
- [x] **Application web jouable** (PWA iPhone/iPad) — voir [`app/`](app/)
- [x] Plateau de NYC (9 quartiers) jouable
- [x] Mode solo (automa « La Pègre ») — version de base
- [ ] Pouvoirs **uniques** par clan (pour l'instant les 8 clans partagent les mêmes archétypes)
- [ ] Deck d'événements (Phase A) dans l'app
- [ ] Ripoux & Procureur jouables dans l'app
- [ ] Équilibrage & playtest
- [ ] Illustrations des personnages

## Documents de design

- [`docs/01-regles.md`](docs/01-regles.md) — Les règles complètes du squelette de jeu.
- [`docs/02-clans.md`](docs/02-clans.md) — Les clans, leurs membres et leurs pouvoirs.
