# Guide de Déploiement - DetectiveDex

## Déploiement sur WildFly

### 1. Installation de WildFly
```bash
# Télécharger WildFly 27+
wget https://github.com/wildfly/wildfly/releases/download/27.0.0.Final/wildfly-27.0.0.Final.tar.gz
tar xzf wildfly-27.0.0.Final.tar.gz
cd wildfly-27.0.0.Final
```

### 2. Build du projet
```bash
cd /path/to/detectivedex
mvn clean package
```

### 3. Déploiement
```bash
# Copier le WAR dans le répertoire standalone/deployments
cp target/detectivedex.war $WILDFLY_HOME/standalone/deployments/

# Lancer WildFly
$WILDFLY_HOME/bin/standalone.sh
```

### 4. Accéder à l'application
```
http://localhost:8080/detectivedex
```

## Configuration H2 Database

H2 est préconfiguré pour développement. Les données sont stockées dans:
```
~/.h2.db
```

## Configuration PostgreSQL (Production)

### 1. Ajouter la dépendance
```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <version>42.7.1</version>
</dependency>
```

### 2. Modifier persistence.xml
```xml
<persistence-unit name="DetectiveDexPU" transaction-type="JTA">
    <jta-data-source>java:jboss/datasources/PostgresDS</jta-data-source>
    <properties>
        <property name="hibernate.dialect" value="org.hibernate.dialect.PostgreSQLDialect"/>
        <property name="hibernate.hbm2ddl.auto" value="update"/>
    </properties>
</persistence-unit>
```

### 3. Créer la datasource dans WildFly CLI
```bash
# Lancer jboss-cli.sh
$WILDFLY_HOME/bin/jboss-cli.sh --connect

# Commander à la base de données
data-source add --name=PostgresDS --jndi-name=java:jboss/datasources/PostgresDS --driver-name=postgresql --connection-url=jdbc:postgresql://localhost:5432/detectivedex --user-name=postgres --password=yourpassword

# Recharger la configuration
reload
```

## Configuration MySQL

### 1. Ajouter la dépendance
```xml
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <version>8.0.33</version>
</dependency>
```

### 2. Modifier persistence.xml
```xml
<property name="hibernate.dialect" value="org.hibernate.dialect.MySQL8Dialect"/>
```

## Configuration HTTPS (Production)

### Générer un certificat auto-signé
```bash
# Générer une clé
keytool -genkey -alias tomcat -keyalg RSA -keystore keystore.jks -validity 365

# Utiliser le keystore dans WildFly
# Dans configuration XML ou CLI
```

## Variables d'Environnement

```bash
export JAVA_OPTS="-Xmx1024m -Xms512m"
export JAVA_TOOL_OPTIONS="-Dfile.encoding=UTF-8"
```

## Sauvegarde et Restauration

### Backup PostgreSQL
```bash
pg_dump -U postgres detectivedex > detectivedex_backup.sql
```

### Restauration
```bash
psql -U postgres detectivedex < detectivedex_backup.sql
```

## Monitoring

Les logs se trouvent dans:
```
$WILDFLY_HOME/standalone/log/server.log
```

Pour activer le logging détaillé, modifier:
```
$WILDFLY_HOME/standalone/configuration/standalone.xml
```

## Load Balancing

Pour déployer sur plusieurs instances:

1. Configurer la réplication de session dans WildFly
2. Utiliser un load balancer (Nginx, Apache)
3. Utiliser une base de données centralisée

## Docker

### Dockerfile exemple
```dockerfile
FROM openjdk:17-jdk
RUN apt-get update && apt-get install -y wget
RUN wget https://github.com/wildfly/wildfly/releases/download/27.0.0.Final/wildfly-27.0.0.Final.tar.gz && \
    tar xzf wildfly-27.0.0.Final.tar.gz && \
    mv wildfly-27.0.0.Final /opt/wildfly && \
    rm wildfly-27.0.0.Final.tar.gz

COPY target/detectivedex.war /opt/wildfly/standalone/deployments/
EXPOSE 8080
CMD ["/opt/wildfly/bin/standalone.sh", "-b", "0.0.0.0"]
```

### Build et Run
```bash
docker build -t detectivedex:latest .
docker run -p 8080:8080 detectivedex:latest
```

## Troubleshooting

### Application ne démarre pas
1. Vérifier les logs: `$WILDFLY_HOME/standalone/log/server.log`
2. Vérifier que le port 8080 est libre
3. Vérifier la base de données est accessible

### Erreur de connexion à la base de données
1. Vérifier les credentials dans persistence.xml
2. Vérifier que le serveur de BD est actif
3. Vérifier les droits utilisateur

### Problèmes CORS
Si le frontend ne peut pas communiquer avec l'API:
1. Vérifier que le CorsFilter est actif
2. Vérifier l'URL de base dans api.js
3. Débuger avec les outils de développement du navigateur

## Performance Tuning

### Heap Memory
```bash
export JAVA_OPTS="-Xmx2048m -Xms1024m"
```

### Connection Pool
Dans WildFly datasource:
```
min-pool-size: 10
max-pool-size: 50
idle-timeout-minutes: 15
```

### Database Indexes
```sql
CREATE INDEX idx_node_type ON evidence_nodes(node_type);
CREATE INDEX idx_node_severity ON evidence_nodes(severity);
CREATE INDEX idx_relation_source ON relations(source_node_id);
CREATE INDEX idx_relation_target ON relations(target_node_id);
```
