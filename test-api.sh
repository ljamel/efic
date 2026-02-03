#!/bin/bash

# Script de test de l'API DetectiveDex
# Utilisation: ./test-api.sh

BASE_URL="http://localhost:8080/detectivedex/api"

echo "=== Test API DetectiveDex ==="
echo ""

# Couleurs pour l'affichage
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les titres
print_title() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

# Fonction pour afficher le succès
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# 1. Créer des nœuds
print_title "Création de nœuds"

NODE1=$(curl -s -X POST "${BASE_URL}/nodes" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Injection SQL sur login",
    "nodeType": "VULNERABILITY",
    "severity": "CRITICAL",
    "description": "Vulnérabilité SQL Injection détectée sur la page de login",
    "status": "OPEN",
    "color": "#e74c3c"
  }' | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

print_success "Nœud 1 créé: ID=$NODE1"

NODE2=$(curl -s -X POST "${BASE_URL}/nodes" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Attaque par force brute",
    "nodeType": "INCIDENT",
    "severity": "HIGH",
    "description": "Tentatives répétées de connexion détectées",
    "status": "OPEN",
    "color": "#e67e22"
  }' | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

print_success "Nœud 2 créé: ID=$NODE2"

NODE3=$(curl -s -X POST "${BASE_URL}/nodes" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Compromission de compte",
    "nodeType": "IMPACT",
    "severity": "CRITICAL",
    "description": "Compte administrateur compromis",
    "status": "OPEN",
    "color": "#c0392b"
  }' | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

print_success "Nœud 3 créé: ID=$NODE3"

NODE4=$(curl -s -X POST "${BASE_URL}/nodes" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Attaquant - 192.168.1.100",
    "nodeType": "ATTACKER",
    "severity": "CRITICAL",
    "description": "Source de l'\''attaque identifiée",
    "status": "OPEN",
    "color": "#8e44ad"
  }' | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

print_success "Nœud 4 créé: ID=$NODE4"

echo ""

# 2. Créer des relations
print_title "Création de relations"

curl -s -X POST "${BASE_URL}/relations" \
  -H "Content-Type: application/json" \
  -d "{
    \"sourceNode\": {\"id\": $NODE4},
    \"targetNode\": {\"id\": $NODE1},
    \"relationType\": \"EXPLOITS\",
    \"description\": \"L'\''attaquant exploite la vulnérabilité\",
    \"confidence\": \"HIGH\",
    \"confirmed\": true
  }" > /dev/null

print_success "Relation 1: Attaquant exploite Vulnérabilité"

curl -s -X POST "${BASE_URL}/relations" \
  -H "Content-Type: application/json" \
  -d "{
    \"sourceNode\": {\"id\": $NODE1},
    \"targetNode\": {\"id\": $NODE3},
    \"relationType\": \"CAUSES\",
    \"description\": \"L'\''exploitation cause la compromission\",
    \"confidence\": \"HIGH\",
    \"confirmed\": true
  }" > /dev/null

print_success "Relation 2: Vulnérabilité cause Compromission"

curl -s -X POST "${BASE_URL}/relations" \
  -H "Content-Type: application/json" \
  -d "{
    \"sourceNode\": {\"id\": $NODE4},
    \"targetNode\": {\"id\": $NODE2},
    \"relationType\": \"TRIGGERED_BY\",
    \"description\": \"L'\''attaque déclenche l'\''incident\",
    \"confidence\": \"MEDIUM\",
    \"confirmed\": false
  }" > /dev/null

print_success "Relation 3: Incident déclenché par Attaque"

echo ""

# 3. Ajouter des événements à la timeline
print_title "Ajout d'événements à la timeline"

curl -s -X POST "${BASE_URL}/timeline" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"Vulnérabilité découverte lors du scan\",
    \"description\": \"Scanner de sécurité identifie une faille SQL Injection\",
    \"eventDate\": \"2024-02-01T10:00:00\",
    \"eventType\": \"DISCOVERED\",
    \"evidence\": \"CVSS Score: 9.8\",
    \"evidenceNode\": {\"id\": $NODE1}
  }" > /dev/null

print_success "Événement 1: Découverte"

curl -s -X POST "${BASE_URL}/timeline" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"Incident de sécurité signalé\",
    \"description\": \"Tentatives de connexion suspectes détectées\",
    \"eventDate\": \"2024-02-02T14:30:00\",
    \"eventType\": \"CONFIRMED\",
    \"evidence\": \"Logs IDS indiquent exploitation active\",
    \"evidenceNode\": {\"id\": $NODE2}
  }" > /dev/null

print_success "Événement 2: Confirmation"

echo ""

# 4. Récupérer tous les nœuds
print_title "Récupération des nœuds"

echo "Résponse du serveur:"
curl -s -X GET "${BASE_URL}/nodes" | python3 -m json.tool | head -30

echo ""

# 5. Récupérer les relations
print_title "Récupération des relations"

echo "Nombre de relations:"
curl -s -X GET "${BASE_URL}/relations" | grep -o '"id"' | wc -l

echo ""

# 6. Récupérer les statistiques
print_title "Statistiques"

curl -s -X GET "${BASE_URL}/reports/statistics" | python3 -m json.tool

echo ""

# 7. Filtrer par sévérité
print_title "Nœuds critiques"

curl -s -X GET "${BASE_URL}/nodes/severity/CRITICAL" | python3 -m json.tool

echo ""

# 8. Exporter en JSON
print_title "Export JSON"

curl -s -X GET "${BASE_URL}/reports/export/json" -o export.json
print_success "Export JSON sauvegardé dans export.json"

echo ""
print_success "Tests terminés avec succès!"
echo ""
echo "Accédez à l'application web sur: http://localhost:8080/detectivedex"
