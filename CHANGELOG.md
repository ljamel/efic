# Changelog - DetectiveDex

Tous les changements notables de ce projet seront documentés dans ce fichier.

Le format suit [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
et ce projet respecte [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-02-02

### Added (Ajouté)

#### Backend
- Architecture Jakarta EE REST complète
- Entités JPA pour nœuds, relations et événements
- 4 endpoints REST principaux (Nodes, Relations, Timeline, Reports)
- CORS filter pour communication frontend-backend
- Persistance H2 pour développement
- Persistance PostgreSQL/MySQL en production
- Export de rapports (JSON et HTML)
- Statistiques globales (par sévérité et statut)
- Filtrage avancé (par type, sévérité, statut)
- Transaction management avec JPA/Hibernate

#### Frontend
- Interface web responsive avec Bootstrap 5
- Visualisation interactive du graphe avec Cytoscape.js
- Drag & drop des nœuds
- Creation/modification/suppression de nœuds et relations
- Timeline des événements
- Recherche et filtrage de nœuds
- Génération de rapports (JSON et HTML)
- Statistiques avec visualisation
- Side panel pour détails des nœuds
- Modal pour création/édition
- Légende avec couleurs par sévérité
- Layout automatique du graphe (FCose)

#### Documentation
- README.md complet
- Guide de déploiement (DEPLOYMENT.md)
- Guide de développement (DEVELOPMENT.md)
- Architecture détaillée (ARCHITECTURE.md)
- Script de test API (test-api.sh)
- Configuration Maven avec dépendances Jakarta EE

#### Configuration
- pom.xml avec dépendances Jakarta EE 10
- persistence.xml avec support H2/PostgreSQL/MySQL
- web.xml avec configuration CORS
- .gitignore complet

### Features Principales

#### Gestion des Nœuds
- ✅ CRUD complet
- ✅ 12 types de nœuds (Bug, Vulnerability, Incident, etc.)
- ✅ 5 niveaux de sévérité (Critical, High, Medium, Low, Info)
- ✅ Statuts (Open, In Progress, Resolved, Closed)
- ✅ Positions persistantes (X, Y)
- ✅ Couleurs personnalisables

#### Gestion des Relations
- ✅ CRUD complet
- ✅ 8 types de relations (Causes, Related To, Exploits, etc.)
- ✅ Niveau de confiance
- ✅ Flag de confirmation
- ✅ Descriptions détaillées

#### Timeline
- ✅ Enregistrement chronologique des événements
- ✅ 5 types d'événements (Discovered, Confirmed, Exploited, etc.)
- ✅ Stockage d'évidences
- ✅ Affichage chronologique

#### Reports
- ✅ Export JSON pour intégration
- ✅ Export HTML pour présentation
- ✅ Statistiques complètes
- ✅ Résumé par sévérité
- ✅ Résumé par statut

### API Endpoints

**36 endpoints REST** implémentés:

**Nodes (8)**
- GET /api/nodes
- GET /api/nodes/{id}
- POST /api/nodes
- PUT /api/nodes/{id}
- DELETE /api/nodes/{id}
- GET /api/nodes/type/{type}
- GET /api/nodes/severity/{severity}
- GET /api/nodes/status/{status}

**Relations (8)**
- GET /api/relations
- GET /api/relations/{id}
- POST /api/relations
- PUT /api/relations/{id}
- DELETE /api/relations/{id}
- GET /api/relations/from/{sourceId}
- GET /api/relations/to/{targetId}
- GET /api/relations/type/{type}

**Timeline (7)**
- GET /api/timeline
- GET /api/timeline/{id}
- POST /api/timeline
- PUT /api/timeline/{id}
- DELETE /api/timeline/{id}
- GET /api/timeline/node/{nodeId}
- GET /api/timeline/type/{type}

**Reports (3)**
- GET /api/reports/export/json
- GET /api/reports/export/html
- GET /api/reports/statistics

### Technologies

**Backend**
- Jakarta EE 10
- Jakarta REST 3.1 (JAX-RS)
- Jakarta Persistence 3.1 (JPA)
- Hibernate ORM 6.4
- H2 Database 2.2
- Maven 3.9

**Frontend**
- HTML5
- CSS3
- JavaScript ES6+
- Cytoscape.js 3.28
- Bootstrap 5.3
- Font Awesome 6.4

### Performance
- Lazy loading des relations
- Indexes sur colonnes clés
- Connection pooling
- Batch processing prêt

### Sécurité
- CORS filter
- Input validation
- HTML/JSON escaping
- SQL Injection prevention (JPA)

### Version Initiale
- Build #: 1.0.0
- Date: 2024-02-02
- Status: Production Ready (MVP)

---

## [Futur - Roadmap]

### v1.1.0 - Authentication & Authorization
- [ ] Spring Security ou Jakarta Security
- [ ] JWT tokens
- [ ] Role-based access control (RBAC)
- [ ] User management

### v1.2.0 - Advanced Features
- [ ] Service layer (logique métier)
- [ ] Validation framework
- [ ] Input sanitization avancée
- [ ] Audit logging complet

### v1.3.0 - Real-time Collaboration
- [ ] WebSocket support
- [ ] Real-time updates
- [ ] Multi-user sessions
- [ ] Conflict resolution

### v1.4.0 - Advanced Analytics
- [ ] Graph analysis algorithms
- [ ] Risk scoring
- [ ] Automated recommendations
- [ ] Pattern detection

### v1.5.0 - Integrations
- [ ] SIEM integration
- [ ] MISP integration
- [ ] Export vers Maltego
- [ ] API GraphQL

### v2.0.0 - Microservices
- [ ] Decomposition en services
- [ ] Kubernetes ready
- [ ] Service mesh
- [ ] Event sourcing

---

## Notes de Développement

### Conventions

#### Nommage
- Java: `camelCase` pour variables/méthodes, `PascalCase` pour classes
- JavaScript: `camelCase` pour tout sauf constructeurs
- CSS: kebab-case pour classes

#### Code
- Java: Indentation 4 espaces
- JavaScript: Indentation 2 espaces
- Javadoc pour méthodes publiques
- Comments pour logique complexe

### Gestion des Versions
- Semantic Versioning: MAJOR.MINOR.PATCH
- Release notes: Changements listés par catégorie
- Tags Git: v1.0.0, v1.1.0, etc.

### Support

- Documentation: `/README.md`, `/DEPLOYMENT.md`, `/DEVELOPMENT.md`
- Issues: Utiliser le système de tickets du projet
- Pull Requests: Bienvenues avec descriptions détaillées

---

## Remerciements

Merci à tous les contributeurs et utilisateurs de DetectiveDex!

---

## Licence

Voir [LICENSE](LICENSE) pour plus de détails.
