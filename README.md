# Étude détaillée du projet « qafFilesManager »

## 1) Résumé du projet
Ce projet est une application web **statique** (HTML/CSS/JS) en arabe, orientée **RTL**, qui sert de **portail de consultation** pour un dictionnaire/recueil de **terminologie et symboles militaires**. L’interface principale affiche 13 sections (départements) et permet de consulter :
- des **listes de termes, concepts et abréviations** (sections 1 à 11) ;
- des **documents officiels** (PDF/DOC/DOCX) intégrés via un **visualiseur** (sections 12 et 13).

## 2) Structure du projet
Racine du dépôt :
- `qafFilesManager/` : l’application web (front‑end statique)
- `etude.doc` : document bureautique externe (binaire)

Structure principale :
```
qafFilesManager/
├─ index.html
├─ assets/
│  ├─ css/
│  │  ├─ main.css
│  │  └─ document-viewer.css
│  ├─ js/
│  │  └─ main.js
│  ├─ Vendor/
│  │  └─ bootstrap/
│  ├─ lib/
│  │  ├─ jquery-validate/
│  │  └─ jquery-validation-unobtrusive/
│  └─ dep/
│     ├─ dep12.pdf
│     ├─ dep12.docx
│     ├─ dep13.pdf
│     └─ dep13.doc
├─ Department/
│  └─ Details/
│     ├─ 1.html … 13.html
└─ images/
   └─ logo.png
```

## 3) Parcours utilisateur (parcours total)
1. **Page d’accueil** (`index.html`) :
   - Affiche l’en‑tête institutionnel et le logo.
   - Liste 13 sections numérotées (1 → 13).
   - Chaque section est un lien cliquable vers `Department/Details/{n}.html`.

2. **Sections 1 à 11 (terminologie)** :
   - Chaque page présente un **tableau** de termes avec colonnes : numéro, terme, concept, abréviation.
   - Un **champ de recherche** filtre dynamiquement les entrées et met en évidence les correspondances.
   - Des sous‑titres peuvent regrouper des catégories de termes.

3. **Sections 12 et 13 (documents)** :
   - Présentation d’un **visualiseur de document** intégré (iframe).
   - Boutons : **Actualiser**, **Télécharger PDF**, **Télécharger Word**, **Plein écran**.
   - Fallback de téléchargement en cas d’erreur d’affichage.

## 3.1) Résumé du contenu par section (d’après les pages de l’application)
Le contenu est majoritairement en **arabe** (RTL) et organisé par domaines militaires.

1. **Section 1** : Terminologie, concepts et abréviations militaires **des forces terrestres**.
2. **Section 2** : Terminologie, concepts et abréviations militaires **des forces navales**.
3. **Section 3** : Terminologie, concepts et abréviations militaires **des forces aériennes**.
4. **Section 4** : Terminologie et abréviations **opérationnelles** des forces navales.
5. **Section 5** : Terminologie et abréviations **opérationnelles** de la défense aérienne.
6. **Section 6** : Terminologie et abréviations **opérationnelles** des forces aériennes.
7. **Section 7** : Terminologie, concepts et abréviations **de la défense aérienne**.
8. **Section 8** : Terminologie, concepts et abréviations **des armes de destruction massive**.
9. **Section 9** : Terminologie, concepts et abréviations **des communications/systèmes d’information**.
10. **Section 10** : Terminologie, concepts et abréviations **du soutien interarmées / affaires administratives** (approvisionnement, transport, services médicaux).
11. **Section 11** : Terminologie, concepts et abréviations **liées aux séminaires des chefs de formation**.
12. **Section 12** : **Symboles militaires** des forces terrestres et navales (document PDF/DOCX intégré).
13. **Section 13** : **Symboles militaires** des forces aériennes et de la défense aérienne, armes de destruction massive, communications/systèmes d’information, soutien interarmées (document PDF/DOC intégré).

## 4) Éléments clés de l’interface
- **Design RTL** adapté à la langue arabe.
- **Thème visuel institutionnel** avec couleurs sobres et accents dorés.
- **Animations** légères (hover, transitions, effets de surbrillance).
- **Composant “document viewer”** dédié aux PDF/DOC.

## 5) Ressources et dépendances
- **Bootstrap** (mise en page responsive)
- **jQuery** (utilisé par `main.js` pour validation d’inputs et interactions)
- **Font Awesome** (icônes)

## 6) Contenu documentaire
- `assets/dep/dep12.pdf` et `assets/dep/dep12.docx` : documents liés à la section 12.
- `assets/dep/dep13.pdf` et `assets/dep/dep13.doc` : documents liés à la section 13.

## 6.1) Inventaire complet des fichiers (application)
### Pages HTML
- `index.html`
- `Department/Details/1.html`
- `Department/Details/2.html`
- `Department/Details/3.html`
- `Department/Details/4.html`
- `Department/Details/5.html`
- `Department/Details/6.html`
- `Department/Details/7.html`
- `Department/Details/8.html`
- `Department/Details/9.html`
- `Department/Details/10.html`
- `Department/Details/11.html`
- `Department/Details/12.html`
- `Department/Details/13.html`

### Images
- `images/logo.png`

### Documents (PDF/Word)
- `assets/dep/dep12.pdf`
- `assets/dep/dep12.docx`
- `assets/dep/dep13.pdf`
- `assets/dep/dep13.doc`

### Feuilles de style (CSS)
- `assets/css/main.css`
- `assets/css/document-viewer.css`
- `assets/Vendor/bootstrap/css/bootstrap.min.css`

### Scripts (JavaScript)
- `assets/js/main.js`
- `assets/js/jquery.min.js`
- `assets/Vendor/bootstrap/js/bootstrap.bundle.min.js`
- `assets/lib/jquery-validate/jquery.validate.min.js`
- `assets/lib/jquery-validation-unobtrusive/jquery.validate.unobtrusive.min.js`

### Polices
- `_/fonts/Lusail-Regular.html`
- `assets/css/_/fonts/Lusail-Regular.html`
- `Department/Details/_/fonts/Lusail-Regular.html`

## 7) Comment exécuter / consulter le projet
Aucune compilation n’est nécessaire.
1. Ouvrir `qafFilesManager/index.html` dans un navigateur.
2. Naviguer via la liste des départements.
3. Utiliser la recherche dans les sections 1–11.
4. Consulter ou télécharger les documents dans les sections 12–13.

## 9) Version "application moderne" (DB + serveur)
Le dépôt contient maintenant un petit serveur web (FastAPI) qui lit la base SQLite `data/app_data.sqlite` et affiche une interface moderne RTL.

### Installer les dépendances
```bash
./.venv/bin/python -m pip install -r requirements.txt
```

### (Re)générer la base de données depuis les fichiers existants
```bash
./.venv/bin/python tools/build_database.py
```

### Lancer le serveur
```bash
./.venv/bin/python -m uvicorn server.app.main:app --reload --host 127.0.0.1 --port 8000
```

Puis ouvrir: http://127.0.0.1:8000

## 8) Conclusion
Ce projet est un **portail de consultation de terminologie militaire** structuré en 13 sections, combinant **données tabulaires** et **documents officiels**. Il s’agit d’une solution **statique et autonome**, pratique pour un usage local ou en intranet, focalisée sur l’accessibilité du contenu en langue arabe.
