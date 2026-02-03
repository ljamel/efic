# Architecture de DetectiveDex

## Vue d'ensemble Générale

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Web                            │
│  HTML5 + CSS3 + JavaScript (ES6+)                          │
│  Cytoscape.js - Visualisation de graphe interactif         │
│  Bootstrap 5 - Framework UI                                │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST
                       │
┌──────────────────────┴──────────────────────────────────────┐
│                    API Gateway / CORS                        │
│  CorsFilter - Gestion CORS                                 │
│  HTTP Methods: GET, POST, PUT, DELETE                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────┐
│                  Jakarta EE Application                      │
│                   (WildFly/Tomcat)                          │
├─────────────────────────────────────────────────────────────┤
│                    REST Layer (@Path)                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ EvidenceNodeResource    - /api/nodes                   │ │
│  │ RelationResource        - /api/relations               │ │
│  │ TimelineResource        - /api/timeline                │ │
│  │ ReportResource          - /api/reports                 │ │
│  └────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                   Business Logic Layer                       │
│  (Future: Services pour logique métier)                    │
├─────────────────────────────────────────────────────────────┤
│                  JPA/Persistence Layer                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ EntityManager - Gestion des entités                    │ │
│  │ Transaction Management (JTA)                           │ │
│  │ Lazy/Eager Loading Control                             │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────────┘
                       │ JDBC
                       │
┌──────────────────────┴──────────────────────────────────────┐
│                   Data Layer                                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ H2 Database (Développement)                            │ │
│  │ PostgreSQL (Production)                                │ │
│  │ MySQL (Alternative)                                   │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Couches Applicatives

### 1. Couche Présentation (Frontend)
**Responsabilité**: Interface utilisateur interactive

```
index.html
├── Cytoscape Container (#cy)
├── Toolbar (actions principales)
├── Side Panel (détails des nœuds/relations)
├── Timeline Container (événements chronologiques)
└── Modals (création de nœuds/relations)

js/
├── api.js          → Client API REST
└── app.js          → Logique d'application
```

**Technologies**:
- Cytoscape.js: Visualisation et manipulation du graphe
- Bootstrap 5: Layout et composants UI
- Fetch API: Communication HTTP
- DOM API: Manipulation DOM

### 2. Couche API REST
**Responsabilité**: Exposition des services métier via HTTP

```
RestApplication.java
└── @ApplicationPath("/api")

Resources:
├── EvidenceNodeResource
│   ├── GET /nodes
│   ├── POST /nodes
│   ├── PUT /nodes/{id}
│   ├── DELETE /nodes/{id}
│   └── Filtrage (type, sévérité, statut)
│
├── RelationResource
│   ├── CRUD complet
│   └── Requêtes spécialisées (from, to, type)
│
├── TimelineResource
│   ├── CRUD complet
│   └── Timeline d'un nœud spécifique
│
└── ReportResource
    ├── Export JSON
    ├── Export HTML
    └── Statistiques
```

**Patterns**:
- RESTful API avec verbes HTTP appropriés
- Stateless (pas de session côté serveur)
- Réponses JSON standardisées
- Gestion d'erreurs avec codes HTTP

### 3. Couche Métier (à développer)
**Responsabilité**: Logique applicative

```
service/
├── EvidenceNodeService
├── RelationService
├── TimelineService
└── ReportService
```

**À ajouter**:
- Validation métier
- Logique complexe de graphe
- Transactions multi-entités
- Calcul de risques/scores

### 4. Couche Persistence (JPA)
**Responsabilité**: Accès aux données

```
entity/
├── EvidenceNode.java
│   ├── @OneToMany → outgoingRelations
│   ├── @OneToMany → incomingRelations
│   └── @OneToMany → events
│
├── Relation.java
│   ├── @ManyToOne → sourceNode
│   └── @ManyToOne → targetNode
│
└── TimelineEvent.java
    └── @ManyToOne → evidenceNode

QueryMethods:
├── Named Queries
├── JPQL Queries
└── Criteria API
```

**Hibernate**:
- ORM mapping
- Lazy/Eager loading
- Transaction management
- Connection pooling

### 5. Couche Base de Données
**Responsabilité**: Persistance des données

```
Tables:
├── evidence_nodes
│   ├── id (PK)
│   ├── name
│   ├── node_type
│   ├── severity
│   ├── position_x, position_y
│   └── status, created_at, updated_at
│
├── relations
│   ├── id (PK)
│   ├── source_node_id (FK)
│   ├── target_node_id (FK)
│   ├── relation_type
│   ├── confirmed, confidence
│   └── created_at
│
└── timeline_events
    ├── id (PK)
    ├── evidence_node_id (FK)
    ├── event_date
    ├── event_type
    └── created_at

Indexes:
├── idx_node_type
├── idx_node_severity
├── idx_relation_source
└── idx_relation_target
```

## Flux de Données

### Création d'un Nœud

```
1. Frontend
   └─> Formulaire modal
       └─> Validation client
           └─> API.createNode()
               └─> HTTP POST

2. Backend
   └─> EvidenceNodeResource.createNode()
       └─> EntityManager.persist()
           └─> Transaction commit
               └─> Database INSERT

3. Response
   └─> HTTP 201 Created
       └─> Entity Node (avec ID généré)
           └─> Frontend update graph
```

### Création d'une Relation

```
Prérequis: 2 nœuds existants

1. Frontend
   └─> Sélection source + target
       └─> Validation (différents)
           └─> API.createRelation()

2. Backend
   └─> RelationResource.createRelation()
       └─> Vérification existence des nœuds
           └─> EntityManager.persist(relation)
               └─> Lazy loading des nœuds

3. Response
   └─> Relation créée
       └─> Frontend redessine le graphe
```

### Récupération du Graphe Complet

```
1. Frontend - loadGraphData()
   ├─> API.getAllNodes()
   │   └─> Attendre réponse
   │
   └─> API.getAllRelations()
       └─> Attendre réponse

2. Backend
   ├─> EvidenceNodeResource.getAllNodes()
   │   └─> TypedQuery<EvidenceNode>
   │       └─> getResultList()
   │
   └─> RelationResource.getAllRelations()
       └─> TypedQuery<Relation>
           └─> getResultList()

3. Frontend
   └─> updateCytoscapeGraph()
       ├─> cy.add([nodes, edges])
       ├─> Appliquer styles/couleurs
       └─> Layout automatique
```

## Sécurité et Intégrité

### CORS
```
CorsFilter.java
└─> Access-Control-Allow-*
    ├─> Methods: GET, POST, PUT, DELETE
    ├─> Headers: Content-Type
    └─> Origin: * (à restreindre)
```

### Validation
- JPA: Constraints (`@NotNull`, `@Length`)
- Input: Validation côté serveur dans REST Resources
- Output: Échappement HTML/JSON

### Transactions
- JTA: Gestion automatique par conteneur
- `@Transactional`: À ajouter aux services
- Rollback automatique en cas d'erreur

## Performance

### Requêtes
- Lazy Loading: Évite les chargements inutiles
- Eager Loading: Pour les relations fréquemment utilisées
- Pagination: À implémenter pour gros graphes

### Caching
- JPA L1 Cache (EntityManager session)
- L2 Cache (EhCache): À activer en production

### Indexes
```sql
CREATE INDEX idx_node_type ON evidence_nodes(node_type);
CREATE INDEX idx_node_severity ON evidence_nodes(severity);
CREATE INDEX idx_relation_source ON relations(source_node_id);
CREATE INDEX idx_relation_target ON relations(target_node_id);
```

## Scalabilité Future

### Cluster
- Session replication
- Distributed cache
- Load balancer

### Microservices
- Service par domaine (Nodes, Relations, Timeline)
- Service d'export/rapport
- Communication via événements

### Real-time
- WebSocket pour collaboration
- Server-sent events pour notifications
- Message broker (JMS, Kafka)

## Diagramme d'Entité-Relation

```
┌─────────────────────────┐
│     EvidenceNode        │
├─────────────────────────┤
│ id (PK)                 │
│ name                    │
│ description             │
│ nodeType                │
│ severity                │
│ status                  │
│ positionX, positionY    │
│ color                   │
│ createdAt, updatedAt    │
└────────┬────────────────┘
         │ 1
         │
    ┌────┴────┐
    │          │
    │ 1    *   │
    ▼          ▼
┌──────────────────────┐   ┌──────────────────────┐
│    Relation          │   │   TimelineEvent      │
├──────────────────────┤   ├──────────────────────┤
│ id (PK)              │   │ id (PK)              │
│ sourceNode_id (FK)   │   │ evidenceNode_id (FK) │
│ targetNode_id (FK)   │   │ title                │
│ relationType         │   │ description          │
│ description          │   │ eventDate            │
│ confirmed            │   │ eventType            │
│ confidence           │   │ evidence             │
│ createdAt            │   │ createdAt            │
└──────────────────────┘   └──────────────────────┘
```

## Configuration et Déploiement

### Environment Variables
```bash
JAVA_HOME=/path/to/jdk17
MAVEN_HOME=/path/to/maven
WILDFLY_HOME=/path/to/wildfly
```

### Profiles Maven
```xml
<profiles>
    <profile>
        <id>dev</id>
        <!-- H2 Database -->
    </profile>
    <profile>
        <id>prod</id>
        <!-- PostgreSQL -->
    </profile>
</profiles>
```

### Docker
```dockerfile
FROM wildfly:27
COPY target/detectivedex.war /opt/wildfly/standalone/deployments/
```

## Métriques et Monitoring

### À implémenter
- Metrics (Micrometer)
- Health checks
- Performance monitoring
- Error tracking (Sentry)
- Distributed tracing (Jaeger)

## Évolution de l'Architecture

### Phase 1 (Actuelle)
- API REST basique
- Frontend Cytoscape
- Persistance JPA

### Phase 2
- Services métier
- Validation avancée
- Caching
- Pagination

### Phase 3
- WebSocket (real-time)
- Authentification/Autorisation
- Audit logging
- GraphQL API

### Phase 4
- Microservices
- Event sourcing
- CQRS
- Kubernetes ready
