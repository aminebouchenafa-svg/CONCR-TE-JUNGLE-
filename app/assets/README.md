# Images du jeu — où les déposer

Le jeu affiche automatiquement une image si le fichier existe, sinon il garde
l'icône/couleur par défaut. Il suffit de déposer les fichiers au bon endroit
avec le bon nom. (Tu peux aussi me les envoyer dans le chat, je m'occupe du nommage.)

## 1) Image de fond de l'écran titre
- `assets/bg-title.jpg`  → grande image (paysage NYC, ambiance sombre conseillée)

## 2) Emblème de chaque clan (sur les pions du plateau)
- `assets/clans/<clan>/emblem.png`  → carré, fond transparent de préférence

## 3) Portraits des personnages (sur les cartes de la main)
- `assets/clans/<clan>/<role>.jpg`  → format portrait, visage bien cadré

### Codes des clans (`<clan>`)
| code | clan |
|------|------|
| ita | Mafia Italienne |
| mex | Cartels Mexicains |
| irl | Les Irlandais |
| yak | Les Yakuzas |
| ght | Gangs des Ghettos |
| rus | Mafia Russe |
| tri | Triades Chinoises |
| alb | Les Albanais |

### Codes des rôles (`<role>`)
`chef`, `soldat`, `tueur`, `chauffeur`, `cuisinier`, `corrupteur`, `protecteur`

### Exemple
- `assets/clans/ita/chef.jpg`      → portrait de Toto Regini (le Parrain)
- `assets/clans/ita/tueur.jpg`     → portrait de Carlo (le Nettoyeur)
- `assets/clans/ita/emblem.png`    → blason de la mafia italienne
