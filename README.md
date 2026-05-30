# 📅 Planning Annuel

Application web légère, sans dépendance, déployable en 2 minutes sur GitHub Pages.

## 🚀 Mise en ligne sur GitHub Pages

```bash
git init
git add .
git commit -m "init: planning annuel"
git remote add origin https://github.com/VOTRE_NOM/planning-annuel.git
git push -u origin main
```

Puis dans GitHub → **Settings → Pages → Branch: main → Save**.

Votre planning sera accessible à :
`https://VOTRE_NOM.github.io/planning-annuel/`

---

## 📊 Connexion Google Sheets

### 1 — Créer la feuille

Créez un Google Sheet avec cet en-tête en **ligne 1** (les noms de colonnes ne sont pas lus, seul l'ordre compte) :

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| titre | date | catégorie | commentaire | url | label_url | couleur | terminée |

**Format date :** `AAAA-MM-JJ` → ex : `2025-09-15`  
**Couleurs disponibles :** `blue` `teal` `purple` `coral` `amber` `pink` `green`  
**Terminée :** `oui` ou `non`

### 2 — Rendre la feuille publique

Partager → **Tous les utilisateurs disposant du lien** → **Lecteur**

### 3 — Récupérer l'ID

```
https://docs.google.com/spreadsheets/d/ ►ID ICI◄ /edit
```

### 4 — Synchroniser

Cliquer **⟳ Sheets** dans l'application, coller l'ID, cliquer **Importer**.

> La sync est en lecture seule. Pour mettre à jour, modifiez le Sheet puis re-synchronisez.

---

## ⌨️ Raccourcis

| Touche | Action |
|--------|--------|
| `Ctrl/Cmd + N` | Nouvelle tâche |
| `Ctrl/Cmd + F` | Focus recherche |
| `Échap` | Fermer la fenêtre |
| Clic sur un jour | Ajouter une tâche ce jour |

---

## 📁 Structure

```
planning-annuel/
├── index.html   ← application complète
└── README.md    ← ce fichier
```

Aucune dépendance, aucun serveur requis.
