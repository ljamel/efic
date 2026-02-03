# Déploiement sur Vercel

## Prérequis
- Compte Vercel (gratuit) : https://vercel.com
- Git (GitHub, GitLab ou Bitbucket connecté à Vercel)

## Option 1 : Déploiement automatique (recommandé)

### 1. Connecter le repo Git à Vercel
1. Aller sur https://vercel.com
2. Cliquer sur "New Project"
3. Sélectionner votre repo GitHub/GitLab/Bitbucket
4. Vercel configure automatiquement avec `vercel.json`
5. Cliquer sur "Deploy"

À chaque push sur `main`, le site est redéployé automatiquement.

## Option 2 : Déploiement manuel avec Vercel CLI

### 1. Installation de Vercel CLI
```bash
npm install -g vercel
```

### 2. Connexion à Vercel
```bash
vercel login
```

### 3. Déploiement depuis la racine du projet
```bash
cd /home/lamri/Desktop/detectivedex
vercel --prod
```

## Comment ça marche ?

Le `vercel.json` configure :
1. **Build** : Copie `src/main/webapp/*` → `public/` (dossier de sortie)
2. **Routes** : Tout URL non-fichier → `index.html` (SPA)
3. **Cache** : CSS/JS en cache long (31536000s), HTML en cache court (3600s)

## URL de production
Après déploiement :
```
https://detectivedex.vercel.app
```

Ou avec un domaine personnalisé :
```
https://votre-domaine.com
```

## Configuration du domaine personnalisé

### 1. Dans Vercel Dashboard
- Aller sur votre projet
- Settings > Domains
- Ajouter votre domaine

### 2. Configurer les DNS
Chez votre registrar (OVH, Namecheap, etc.) :
- CNAME : `votre-domaine.com` → `cname.vercel-dns.com`

Ou pointer vers les nameservers Vercel (voir instructions dans le dashboard).

## Données & Stockage

- ✅ 100% client-side (localStorage)
- ✅ Pas de base de données
- ✅ Pas de backend
- ✅ Données sauvegardées dans chaque navigateur

**Backup** : Exporter JSON depuis l'app pour sauvegarder.

## Mises à jour du code

### Via GitHub (auto)
```bash
git push origin main
# → Vercel redéploie automatiquement
```

### Via CLI
```bash
vercel --prod
```

## Logs et diagnostics
Dans le dashboard Vercel :
- Logs > Deployments
- Voir les erreurs en temps réel
- Redeployer si besoin

## Limites de Vercel Free
- ✅ Déploiements illimités
- ✅ Bande passante gratuite
- ✅ SSL/HTTPS inclus
- ✅ CDN global
- ❌ Pas de backend Node.js (mais pas besoin ici)

## Troubleshooting

**404 sur refresh** : Vérifié, `vercel.json` reroute tout vers `index.html` ✓

**CSS/JS non chargé** : Cache-bust avec `?v=DATE` dans index.html ✓

**Données perdues** : Normal, localStorage par navigateur. Export JSON pour backup.

## Exemples de commandes
```bash
# Voir le statut du déploiement
vercel status

# Voir les logs
vercel logs

# Redéployer
vercel --prod

# Voir la config
vercel env ls
```

