# Déploiement sur Vercel

## Prérequis
- Compte Vercel (gratuit)
- Vercel CLI installé : `npm install -g vercel`

## Étapes de déploiement

### 1. Installation de Vercel CLI
```bash
npm install -g vercel
```

### 2. Connexion à Vercel
```bash
vercel login
```

### 3. Déploiement
Depuis la racine du projet :
```bash
vercel
```

Ou pour déployer en production directement :
```bash
vercel --prod
```

### 4. Configuration automatique
Vercel détecte automatiquement le `vercel.json` et configure :
- Les fichiers statiques (HTML, CSS, JS)
- Les routes
- Le cache
- Les headers

## Structure déployée
L'application DetectiveDex fonctionne entièrement côté client avec localStorage, donc :
- ✅ Pas de backend nécessaire
- ✅ 100% statique
- ✅ Compatible Vercel
- ✅ Stockage local dans le navigateur

## URL de production
Après déploiement, Vercel fournit une URL du type :
```
https://detectivedex.vercel.app
```

## Variables d'environnement (optionnel)
Si besoin, ajouter des variables dans le dashboard Vercel :
- Settings > Environment Variables

## Domaine personnalisé
Pour ajouter un domaine personnalisé :
1. Aller dans Settings > Domains
2. Ajouter le domaine
3. Configurer les DNS selon les instructions

## Mises à jour
Chaque push sur la branche principale déclenche un nouveau déploiement automatiquement si le repo est connecté à GitHub.

Ou manuellement :
```bash
vercel --prod
```

## Notes
- Les données sont stockées dans localStorage (navigateur)
- Pas de base de données côté serveur
- Exportation JSON disponible pour backup
- Cache agressif sur CSS/JS (immutable)
