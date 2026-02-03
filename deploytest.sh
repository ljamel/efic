# Installer Tomcat
sudo apt install tomcat10

mvn clean test -Dtest=DetectiveDexFunctionalTest

mvn clean package 

# Copier le WAR
sudo cp target/detectivedex.war /var/lib/tomcat10/webapps/

# Démarrer
sudo systemctl start tomcat10

# Accéder
echo "http://localhost:8080/detectivedex"