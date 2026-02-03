# Guide de Développement - DetectiveDex

## Configuration de l'Environnement de Développement

### Prérequis
- Java 17+ (JDK)
- Maven 3.9+
- IDE: IntelliJ IDEA, Eclipse ou Visual Studio Code avec Java Extension Pack
- Git

### Installation

```bash
# Cloner le dépôt
git clone <repository-url>
cd detectivedex

# Builder le projet
mvn clean install

# Lancer les tests
mvn test
```

## Configuration IDE

### IntelliJ IDEA
1. Importer le projet: `File > Open > pom.xml`
2. Configurer le SDK Java: `Project Structure > SDK`
3. Configurer le serveur: `Run > Edit Configurations > Add Tomcat Server`

### Eclipse
1. Importer: `File > Import > Existing Maven Projects`
2. Configurer le runtime: `Window > Preferences > Server > Runtime Environments`

### VS Code
1. Installer: "Extension Pack for Java"
2. Installer: "Maven for Java"
3. Ouvrir le projet dans VS Code

## Développement Local

### Build et Lancement avec Maven

```bash
# Build uniquement
mvn clean package

# Avec un serveur embarqué (Tomcat)
mvn tomcat7:run

# Ou déployer sur WildFly en développement
```

### Configuration pour Développement

Créer un fichier `src/main/resources/application-dev.properties`:

```properties
# Base de données H2
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

# JPA/Hibernate
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# Logging
logging.level.root=INFO
logging.level.com.detectivedex=DEBUG
```

## Développement du Frontend

### Structure des fichiers Frontend
```
src/main/webapp/
├── index.html          # Page principale
├── WEB-INF/
│   └── web.xml        # Configuration web
└── js/
    ├── api.js         # Client API
    └── app.js         # Application
```

### Modification des fichiers

Le frontend utilise Cytoscape.js en CDN. Pour utiliser une version locale:

1. Télécharger Cytoscape.js depuis https://github.com/cytoscape/cytoscape.js
2. Placer dans `src/main/webapp/lib/`
3. Modifier les imports dans `index.html`

### Hot Reload du Frontend

Lors du développement, vous pouvez modifier les fichiers HTML/CSS/JS et rafraîchir le navigateur (F5) pour voir les changements.

## Développement du Backend

### Structure des packages

```
com.detectivedex/
├── RestApplication.java        # Classe application REST
├── entity/                      # Entités JPA
│   ├── EvidenceNode.java
│   ├── NodeType.java
│   ├── SeverityLevel.java
│   ├── Relation.java
│   └── TimelineEvent.java
├── rest/                        # Endpoints REST
│   ├── EvidenceNodeResource.java
│   ├── RelationResource.java
│   ├── TimelineResource.java
│   └── ReportResource.java
├── service/                     # (Futur) Couche métier
└── filter/                      # Filtres
    └── CorsFilter.java
```

### Ajouter un nouvel Endpoint

1. Créer une classe dans `src/main/java/com/detectivedex/rest/`
2. Annoter avec `@Stateless` et `@Path("/api/resource")`
3. Injecter `EntityManager` avec `@PersistenceContext`
4. Implémenter les méthodes avec les annotations REST appropriées

Exemple:
```java
@Stateless
@Path("/api/custom")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CustomResource {
    @PersistenceContext
    private EntityManager em;
    
    @GET
    public Response getAll() {
        // Implémentation
        return Response.ok(data).build();
    }
}
```

### Ajouter une Entité

1. Créer une classe dans `src/main/java/com/detectivedex/entity/`
2. Annoter avec `@Entity` et `@Table`
3. Ajouter des colonnes avec `@Column`
4. Gérer les relations avec `@OneToMany`, `@ManyToOne`, etc.
5. Ajouter au `persistence.xml`

## Tests

### Tests Unitaires

Créer les tests dans `src/test/java/`:

```java
import org.junit.Before;
import org.junit.Test;
import static org.junit.Assert.*;

public class EvidenceNodeTest {
    private EvidenceNode node;
    
    @Before
    public void setup() {
        node = new EvidenceNode("Test Bug", NodeType.BUG, SeverityLevel.HIGH);
    }
    
    @Test
    public void testNodeCreation() {
        assertNotNull(node);
        assertEquals("Test Bug", node.getName());
    }
}
```

Lancer les tests:
```bash
mvn test
```

### Tests d'Intégration

Pour tester les endpoints REST, utiliser un client HTTP:

```bash
# GET
curl -X GET http://localhost:8080/detectivedex/api/nodes

# POST
curl -X POST http://localhost:8080/detectivedex/api/nodes \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Bug",
    "nodeType": "BUG",
    "severity": "HIGH",
    "description": "Description"
  }'

# PUT
curl -X PUT http://localhost:8080/detectivedex/api/nodes/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Name"}'

# DELETE
curl -X DELETE http://localhost:8080/detectivedex/api/nodes/1
```

Ou utiliser Postman/Insomnia pour les tester.

## Debugging

### Debugging Java

Configurer le breakpoint dans l'IDE et lancer en mode debug.

### Debugging Frontend

1. Ouvrir les outils de développement du navigateur (F12)
2. Aller dans l'onglet "Console"
3. Ajouter des `console.log()` dans `js/app.js`
4. Utiliser les breakpoints de l'onglet "Sources"

### Logs

Consulter les logs:
- Backend: `target/wildfly/standalone/log/server.log`
- Frontend: Console du navigateur

## Dépendances

### Ajouter une Dépendance

1. Modifier `pom.xml`
2. Ajouter la dépendance dans la section `<dependencies>`
3. Recharger les dépendances Maven (IDE automatique généralement)

Exemple:
```xml
<dependency>
    <groupId>javax.json</groupId>
    <artifactId>javax.json-api</artifactId>
    <version>1.1.4</version>
</dependency>
```

## Convention de Codage

### Java
- Utiliser camelCase pour les variables et méthodes
- Utiliser PascalCase pour les classes
- Ajouter des Javadoc pour les classes publiques
- Respecter l'indentation 4 espaces

### JavaScript
- Utiliser camelCase pour les variables et fonctions
- Utiliser const/let plutôt que var
- Ajouter des commentaires pour les fonctions complexes
- Utiliser les template literals pour les strings

### HTML/CSS
- Utiliser des classes plutôt que des IDs pour le styling
- Respecter la structure sémantique HTML
- Utiliser les variables CSS pour les couleurs/espacements

## Workflow Git

```bash
# Créer une branche pour votre feature
git checkout -b feature/ma-feature

# Faire vos modifications
# Committer
git commit -m "feat: description de la feature"

# Pousser
git push origin feature/ma-feature

# Créer une Pull Request
```

## Checklist de Développement

Avant de committer:
- [ ] Code compile sans erreurs
- [ ] Tests passent: `mvn test`
- [ ] Code respecte les conventions
- [ ] Documentation à jour si nécessaire
- [ ] Tests ajoutés pour les nouvelles fonctionnalités
- [ ] Pas de code commenté inutile

## Ressources Utiles

- [Jakarta EE Documentation](https://jakarta.ee/learn/)
- [Cytoscape.js Documentation](https://js.cytoscape.org/)
- [Hibernate Documentation](https://hibernate.org/orm/)
- [JPA Specifications](https://jakarta.ee/specifications/persistence/)

## Performance

### Profiling

Utiliser JProfiler ou YourKit pour analyser les performances.

### Optimisations

- Utiliser des requêtes JPQL plutôt que des boucles
- Ajouter des indexes sur les colonnes fréquemment filtrées
- Utiliser la pagination pour les grands jeux de données
- Minimiser les N+1 queries avec eager loading

## Sécurité

### Best Practices

- Valider toutes les entrées utilisateur
- Utiliser HTTPS en production
- Encoder les sorties HTML
- Implémenter une authentification/autorisation
- Protéger contre les injections SQL (JPA le fait automatiquement)

## Contribution

Les contributions sont bienvenues ! Veuillez:
1. Fork le projet
2. Créer une branche feature
3. Committer vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request
