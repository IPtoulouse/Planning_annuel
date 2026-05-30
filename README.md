# 📅 Planning Annuel — Guide complet

Application web avec synchronisation **bidirectionnelle** Google Sheets.

---

## 🚀 1. Mise en ligne sur GitHub Pages

1. Créer un compte sur **github.com**
2. Cliquer **+** → **New repository** → nommer `planning-annuel` → **Public** → **Create**
3. Cliquer **uploading an existing file** → glisser `index.html` et `README.md`
4. Cliquer **Commit changes**
5. Aller dans **Settings → Pages → Branch: main → Save**

Votre planning est en ligne à :
`https://VOTRE_NOM.github.io/planning-annuel/`

---

## 📊 2. Connexion Google Sheets (synchronisation bidirectionnelle)

### Étape A — Créer le Google Sheet

Créez un Google Sheet. Le script créera automatiquement l'onglet **Tâches** avec les bonnes colonnes au premier lancement.

### Étape B — Installer le script Apps Script

1. Dans votre Google Sheet, cliquer **Extensions → Apps Script**
2. Supprimer le code existant dans `Code.gs`
3. Copier-coller tout le contenu du fichier **`apps-script.gs`** fourni
4. Cliquer **💾 Enregistrer** (icône disquette)

### Étape C — Déployer le script

1. Cliquer **Déployer → Nouveau déploiement**
2. Cliquer l'icône ⚙️ à côté de "Sélectionner le type" → choisir **Application Web**
3. Remplir ainsi :
   - **Description** : `Planning annuel`
   - **Exécuter en tant que** : `Moi`
   - **Qui a accès** : `Tout le monde`
4. Cliquer **Déployer**
5. Autoriser les permissions demandées (cliquer **Autoriser**)
6. **Copier l'URL** qui s'affiche — elle ressemble à :
   `https://script.google.com/macros/s/XXXXXXXX/exec`

### Étape D — Connecter l'application

1. Ouvrir votre planning sur GitHub Pages
2. Cliquer **⟳ Sheets** en haut à droite
3. Coller l'URL copiée à l'étape C
4. Cliquer **↓ Importer** ou **↑ Envoyer**

---

## 🔄 Comment fonctionne la synchronisation

| Bouton | Action |
|--------|--------|
| **↓ Importer depuis Sheets** | Récupère les tâches du Sheet et les fusionne localement |
| **↑ Envoyer vers Sheets** | Envoie toutes vos tâches locales vers le Sheet (écrase) |
| **Ajouter une tâche** | Sauvegarde localement ET envoie automatiquement au Sheet |
| **Modifier une tâche** | Met à jour localement ET dans le Sheet |
| **Supprimer une tâche** | Supprime localement ET dans le Sheet |

---

## ⌨️ Raccourcis clavier

| Touche | Action |
|--------|--------|
| `Ctrl/Cmd + N` | Nouvelle tâche |
| `Ctrl/Cmd + F` | Rechercher |
| `Échap` | Fermer la fenêtre |
| Clic sur un jour | Ajouter une tâche ce jour |

---

## 📁 Fichiers

```
planning-annuel/
├── index.html       ← application (thème blanc)
├── apps-script.gs   ← script à coller dans Google Apps Script
└── README.md        ← ce fichier
```
