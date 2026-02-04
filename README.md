# DetectiveDex - Plateforme de Visualisation des Incidents de Sécurité

## Description

**DetectiveDex** est une application web Java EE permettant de représenter des preuves de bugs et incidents de sécurité sous forme de graphe interactif, similaire à **Maltego**. Elle offre une visualisation complète des connexions et relations entre les différents éléments d'une enquête de sécurité.

## Architecture

### Vue d'ensemble

```
detectivedex/
├── pom.xml                          # Configuration Maven
├── src/
│   ├── main/
│   │   ├── java/com/detectivedex/
│   │   │   ├── RestApplication.java         # Configuration REST
│   │   │   ├── entity/                      # Entités JPA
│   │   │   │   ├── EvidenceNode.java
│   │   │   │   ├── NodeType.java
│   │   │   │   ├── SeverityLevel.java
│   │   │   │   ├── Relation.java
│   │   │   │   └── TimelineEvent.java
│   │   │   ├── rest/                        # Endpoints REST
│   │   │   │   ├── EvidenceNodeResource.java
│   │   │   │   ├── RelationResource.java
│   │   │   │   ├── TimelineResource.java
│   │   │   │   └── ReportResource.java
│   │   │   └── filter/
│   │   │       └── CorsFilter.java          # Filtre CORS
│   │   ├── resources/
│   │   │   └── META-INF/
│   │   │       └── persistence.xml          # Configuration JPA
│   │   └── webapp/
│   │       ├── index.html                   # Interface principale
│   │       ├── WEB-INF/
│   │       │   └── web.xml                  # Configuration web
│   │       └── js/
│   │           ├── api.js                   # Module API
│   │           └── app.js                   # Module application
│   └── test/
└── README.md
```

## Stack Technologique

### Backend
- **Jakarta EE 10** - Framework Java EE
- **Jakarta REST (JAX-RS)** - API REST
- **Jakarta Persistence (JPA)** - ORM
- **Hibernate 6.4** - Provider JPA
- **H2 Database** - Base de données (développement)
- **Maven 3.9** - Build tool

### Frontend
- **HTML5** - Markup
- **CSS3** - Styling
- **JavaScript (ES6+)** - Logique
- **Cytoscape.js** - Visualisation de graphe
- **Bootstrap 5** - Framework CSS
- **Font Awesome** - Icônes

## Entités JPA

### EvidenceNode
Représente un nœud du graphe (preuve, incident, artefact, etc.)

```java
- id: Long
- name: String
- description: String
- nodeType: NodeType (BUG, VULNERABILITY, INCIDENT, ARTIFACT, ENDPOINT, ATTACKER, MALWARE, IOC, IMPACT, MITIGATION, EVIDENCE, ACTOR)
- severity: SeverityLevel (CRITICAL, HIGH, MEDIUM, LOW, INFO)
- positionX, positionY: Double
- color: String
- status: String (OPEN, IN_PROGRESS, RESOLVED, CLOSED)
- createdAt, updatedAt: LocalDateTime
- outgoingRelations, incomingRelations: Set<Relation>
- events: Set<TimelineEvent>
```

### Relation
Représente une connexion entre deux nœuds

```java
- id: Long
- sourceNode: EvidenceNode
- targetNode: EvidenceNode
- relationType: String (CAUSES, RELATED_TO, EXPLOITS, TRIGGERED_BY, MITIGATES, etc.)
- description: String
- confirmed: Boolean
- confidence: String (HIGH, MEDIUM, LOW)
- createdAt: LocalDateTime
```

### TimelineEvent
Représente un événement dans l'historique d'un nœud

```java
- id: Long
- evidenceNode: EvidenceNode
- title: String
- description: String
- eventDate: LocalDateTime
- eventType: String (DISCOVERED, CONFIRMED, EXPLOITED, MITIGATED, ESCALATED)
- evidence: String
- createdAt: LocalDateTime
```

## Endpoints REST API

Tous les endpoints sont préfixés par `/api`

### Nœuds (`/nodes`)
- `GET /nodes` - Récupère tous les nœuds
- `GET /nodes/{id}` - Récupère un nœud spécifique
- `POST /nodes` - Crée un nouveau nœud
- `PUT /nodes/{id}` - Met à jour un nœud
- `DELETE /nodes/{id}` - Supprime un nœud
- `GET /nodes/type/{type}` - Récupère les nœuds par type
- `GET /nodes/severity/{severity}` - Récupère les nœuds par sévérité
- `GET /nodes/status/{status}` - Récupère les nœuds par statut

### Relations (`/relations`)
- `GET /relations` - Récupère toutes les relations
- `GET /relations/{id}` - Récupère une relation spécifique
- `POST /relations` - Crée une nouvelle relation
- `PUT /relations/{id}` - Met à jour une relation
- `DELETE /relations/{id}` - Supprime une relation
- `GET /relations/from/{sourceId}` - Récupère les relations d'un nœud source
- `GET /relations/to/{targetId}` - Récupère les relations vers un nœud cible
- `GET /relations/type/{type}` - Récupère les relations par type

### Timeline (`/timeline`)
- `GET /timeline` - Récupère tous les événements
- `GET /timeline/{id}` - Récupère un événement spécifique
- `POST /timeline` - Crée un nouvel événement
- `PUT /timeline/{id}` - Met à jour un événement
- `DELETE /timeline/{id}` - Supprime un événement
- `GET /timeline/node/{nodeId}` - Récupère les événements d'un nœud
- `GET /timeline/type/{type}` - Récupère les événements par type

### Rapports (`/reports`)
- `GET /reports/export/json` - Exporte le graphe en JSON
- `GET /reports/export/html` - Exporte un rapport HTML
- `GET /reports/statistics` - Récupère les statistiques globales

## Installation et Configuration

### Prérequis
- Java 17+
- Maven 3.9+
- Application Server Jakarta EE compatible (WildFly, Tomcat, GlassFish)

### Build
```bash
mvn clean package
```

### Déploiement
1. Déployer le fichier WAR sur votre serveur d'application
2. Accéder à `http://localhost:8080/detectivedex`

### Configuration de la Base de Données

Pour utiliser une autre base de données que H2:
1. Modifier `src/main/resources/META-INF/persistence.xml`
2. Ajouter les dépendances du driver JDBC approprié au `pom.xml`
3. Configurer la source de données sur le serveur d'application

Exemple pour PostgreSQL:
```xml
<property name="hibernate.dialect" value="org.hibernate.dialect.PostgreSQLDialect"/>
```

## Fonctionnalités

### Visualisation du Graphe
- Drag & drop des nœuds
- Zoom et pan
- Disposition automatique (FCose layout)
- Coloration par sévérité
- Icônes par type de nœud

### Gestion des Nœuds
- Création/modification/suppression
- Différents types et sévérités
- Statut personnalisable
- Descriptions détaillées

### Relations
- Création de connexions entre nœuds
- 8 types de relations différents
- Niveau de confiance ajustable
- Marque de confirmation

### Timeline
- Enregistrement des événements chronologiques
- Différents types d'événements
- Stockage d'évidences
- Affichage chronologique

### Export et Rapports
- Export en JSON pour intégration
- Export en HTML pour présentation
- Statistiques complètes
- Résumés par sévérité et statut

### Recherche
- Recherche par nom de nœud
- Filtrage par type, sévérité, statut
- Mise en surbrillance des résultats

## Exemple d'Utilisation

### Créer un incident de sécurité

1. **Ajouter les nœuds principaux**:
   - Incident de sécurité (type: INCIDENT, sévérité: CRITICAL)
   - Vulnérabilité détectée (type: VULNERABILITY, sévérité: HIGH)
   - Attaquant (type: ATTACKER)

2. **Créer les relations**:
   - Attaquant -> Exploite -> Vulnérabilité
   - Vulnérabilité -> Cause -> Incident

3. **Ajouter les détails**:
   - Ajouter des événements à la timeline
   - Documenter l'exploit
   - Marquer les relations confirmées

4. **Exporter le rapport**:
   - Export HTML pour présentation
   - Export JSON pour intégration avec d'autres outils

## API Client (JavaScript)

Le fichier `api.js` fournit un client API simplifié:

```javascript
// Récupérer tous les nœuds
const nodes = await API.getAllNodes();

// Créer un nœud
await API.createNode({
    name: "SQL Injection",
    nodeType: "VULNERABILITY",
    severity: "HIGH",
    description: "Injection SQL sur le formulaire de login"
});

// Créer une relation
await API.createRelation({
    sourceNode: { id: 1 },
    targetNode: { id: 2 },
    relationType: "EXPLOITS",
    confidence: "HIGH"
});
```

## Sécurité

- Filtre CORS activé pour contrôler l'accès cross-origin
- Les données sensibles doivent être chiffrées en production
- Utiliser HTTPS obligatoirement en production
- Implémenter l'authentification/autorisation selon les besoins

## Performance

- Lazy loading des relations
- Pagination recommandée pour les gros graphes
- Indexes sur les colonnes fréquemment filtrées
- Caching côté client des données

## Améliorations Futures

- [ ] capture d'image
- [ ] Versioning et historique des modifications et ajouter de nouveau projet et effacer
- [ ] Intégration avec outils SIEM
- [ ] Analyse de risque automatique
- [ ] Plans réseau, ordinateur, serveur, ip, serveur ou plans simplifier
- [ ] Support de multi-graphes/projets
- [ ] Plugins et extensibilité

## Support

Pour toute question ou bug report, contactez l'équipe de développement.
