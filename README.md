# CV — Quentin Samudio

CV interactif en HTML/CSS/JS, consultable dans le navigateur et exportable en PDF via l'impression.

## Prérequis

Aucune dépendance à installer. Le projet fonctionne avec un simple navigateur web.

> Pour éviter les restrictions CORS sur le chargement de la photo de profil, il est recommandé de lancer un petit serveur local plutôt que d'ouvrir le fichier directement (`file://`).

## Structure du projet

```
cv/
├── index.html       # Structure du CV
├── styles.css       # Mise en page, thème vert, styles impression
├── script.js        # Édition du texte de présentation + export PDF
└── profile.jpg      # Photo de profil (à placer ici)
```

## Lancer en local

### Option 1 — Python (recommandé)

```bash
cd cv/
python3 -m http.server 8080
```

Puis ouvrir [http://localhost:8080](http://localhost:8080) dans le navigateur.

### Option 2 — Node.js

```bash
npx serve .
```

Puis suivre l'URL affichée dans le terminal (généralement [http://localhost:3000](http://localhost:3000)).

### Option 3 — Extension VS Code

Installer l'extension **Live Server** (Ritwick Dey), faire un clic droit sur `index.html` → **Open with Live Server**.

## Exporter en PDF

1. Ouvrir le CV dans le navigateur
2. Cliquer sur le bouton **📥 Télécharger en PDF**
3. Dans la boîte de dialogue d'impression du navigateur :
   - Destination : **Enregistrer en PDF**
   - Format : **A4**
   - Marges : **Aucune** (ou Minimum)
   - Cocher **Graphiques d'arrière-plan** pour conserver les couleurs

> Les styles `@media print` sont optimisés pour un rendu A4 une page.

## Personnaliser le texte de présentation

Le chapeau du CV est modifiable directement depuis le navigateur sans toucher au code :

1. Cliquer sur **✏ Modifier le texte de présentation**
2. Éditer le texte dans la zone qui apparaît
3. Cliquer sur **✓ Enregistrer**

Utile pour adapter le CV à chaque offre d'emploi avant d'exporter le PDF.
