/**
 * Module Application - Logique principale de l'interface
 * Utilise les configurations centralisées de AppConfig et Utils
 */

let cy = null;
let selectedNode = null;
let selectedNodes = [];
let nodes = [];
let relations = [];

// Initialisation au chargement du document
document.addEventListener('DOMContentLoaded', () => {
    initializeCytoscape();
    attachEventListeners();
    loadGraphData();
});

/**
 * Initialise Cytoscape.js
 */
function initializeCytoscape() {
    cy = cytoscape({
        container: document.getElementById('cy'),
        style: AppConfig.cytoscape.style,
        layout: {
            name: 'cose',
            animate: true,
            animationDuration: 500,
            randomize: false,
            idealEdgeLength: 100,
            nodeOverlap: 20,
            refresh: 20,
            fit: true,
            padding: 30
        }
    });

    // Événements Cytoscape
    cy.on('tap', 'node', (evt) => {
        selectedNode = evt.target;
        showNodeDetails(selectedNode.data());
    });

    cy.on('tap', 'edge', (evt) => {
        showRelationDetails(evt.target.data());
    });

    cy.on('free', 'node', (evt) => {
        const node = evt.target;
        const position = node.position();
        updateNodePosition(node.id(), position.x, position.y);
    });

    cy.on('tap', (evt) => {
        if (evt.target === cy) {
            selectedNode = null;
            document.getElementById('sidePanel').classList.remove('active');
        }
    });
}

/**
 * Gère le stockage local des données
 */
const LocalStorage = {
    NODES_KEY: 'detectivedex_nodes',
    RELATIONS_KEY: 'detectivedex_relations',
    EVENTS_KEY: 'detectivedex_events',
    NODE_ID_COUNTER: 'detectivedex_node_id_counter',
    RELATION_ID_COUNTER: 'detectivedex_relation_id_counter',
    EVENT_ID_COUNTER: 'detectivedex_event_id_counter',

    getNextNodeId() {
        let counter = parseInt(localStorage.getItem(this.NODE_ID_COUNTER) || '0') + 1;
        localStorage.setItem(this.NODE_ID_COUNTER, counter.toString());
        return counter;
    },

    getNextRelationId() {
        let counter = parseInt(localStorage.getItem(this.RELATION_ID_COUNTER) || '0') + 1;
        localStorage.setItem(this.RELATION_ID_COUNTER, counter.toString());
        return counter;
    },

    getNextEventId() {
        let counter = parseInt(localStorage.getItem(this.EVENT_ID_COUNTER) || '0') + 1;
        localStorage.setItem(this.EVENT_ID_COUNTER, counter.toString());
        return counter;
    },

    getAllNodes() {
        const data = localStorage.getItem(this.NODES_KEY);
        return data ? JSON.parse(data) : [];
    },

    getAllRelations() {
        const data = localStorage.getItem(this.RELATIONS_KEY);
        return data ? JSON.parse(data) : [];
    },

    getAllEvents() {
        const data = localStorage.getItem(this.EVENTS_KEY);
        return data ? JSON.parse(data) : [];
    },

    getTimelineEventsForNode(nodeId) {
        const events = this.getAllEvents();
        return events.filter(e => e.evidenceNode?.id === nodeId).sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate));
    },

    saveNode(node) {
        if (!node.id) {
            node.id = this.getNextNodeId();
            node.createdAt = new Date().toISOString();
        }
        node.updatedAt = new Date().toISOString();
        
        const nodes = this.getAllNodes();
        const index = nodes.findIndex(n => n.id === node.id);
        if (index >= 0) {
            nodes[index] = node;
        } else {
            nodes.push(node);
        }
        localStorage.setItem(this.NODES_KEY, JSON.stringify(nodes));
        return node;
    },

    deleteNode(nodeId) {
        let nodes = this.getAllNodes();
        nodes = nodes.filter(n => n.id !== nodeId);
        localStorage.setItem(this.NODES_KEY, JSON.stringify(nodes));

        // Supprimer aussi les relations associées
        let relations = this.getAllRelations();
        relations = relations.filter(r => r.sourceNode?.id !== nodeId && r.targetNode?.id !== nodeId);
        localStorage.setItem(this.RELATIONS_KEY, JSON.stringify(relations));
    },

    saveRelation(relation) {
        if (!relation.id) {
            relation.id = this.getNextRelationId();
            relation.createdAt = new Date().toISOString();
        }
        relation.updatedAt = new Date().toISOString();

        const relations = this.getAllRelations();
        const index = relations.findIndex(r => r.id === relation.id);
        if (index >= 0) {
            relations[index] = relation;
        } else {
            relations.push(relation);
        }
        localStorage.setItem(this.RELATIONS_KEY, JSON.stringify(relations));
        return relation;
    },

    deleteRelation(relationId) {
        let relations = this.getAllRelations();
        relations = relations.filter(r => r.id !== relationId);
        localStorage.setItem(this.RELATIONS_KEY, JSON.stringify(relations));
    },

    saveEvent(event) {
        if (!event.id) {
            event.id = this.getNextEventId();
        }
        
        const events = this.getAllEvents();
        const index = events.findIndex(e => e.id === event.id);
        if (index >= 0) {
            events[index] = event;
        } else {
            events.push(event);
        }
        localStorage.setItem(this.EVENTS_KEY, JSON.stringify(events));
        return event;
    },

    clear() {
        localStorage.removeItem(this.NODES_KEY);
        localStorage.removeItem(this.RELATIONS_KEY);
        localStorage.removeItem(this.EVENTS_KEY);
        localStorage.removeItem(this.NODE_ID_COUNTER);
        localStorage.removeItem(this.RELATION_ID_COUNTER);
        localStorage.removeItem(this.EVENT_ID_COUNTER);
    },

    exportData() {
        return {
            nodes: this.getAllNodes(),
            relations: this.getAllRelations(),
            events: this.getAllEvents()
        };
    },

    importData(data) {
        if (data.nodes) localStorage.setItem(this.NODES_KEY, JSON.stringify(data.nodes));
        if (data.relations) localStorage.setItem(this.RELATIONS_KEY, JSON.stringify(data.relations));
        if (data.events) localStorage.setItem(this.EVENTS_KEY, JSON.stringify(data.events));
    }
};

/**
 * Charge les données du graphe depuis localStorage
 */
function loadGraphData() {
    showLoadingSpinner(true);
    try {
        nodes = LocalStorage.getAllNodes();
        relations = LocalStorage.getAllRelations();

        if (nodes.length === 0 && relations.length === 0) {
            seedDefaultInvestigationGraph();
            nodes = LocalStorage.getAllNodes();
            relations = LocalStorage.getAllRelations();
            Utils.showToast('Modèle d’investigation chargé', 'info');
        }

        Utils.log('Données chargées depuis localStorage:', nodes.length, 'nœuds,', relations.length, 'relations');
        updateCytoscapeGraph();
        updateNodeSelects();
        if (cy && cy.nodes().length > 0) {
            cy.fit(cy.elements(), 50);
        }
    } catch (error) {
        Utils.error('Erreur lors du chargement des données:', error);
        Utils.showToast('Erreur lors du chargement des données', 'error');
    } finally {
        showLoadingSpinner(false);
    }
}

/**
 * Ajoute un modèle d'investigation cyber par défaut
 */
function seedDefaultInvestigationGraph() {
    const incident = LocalStorage.saveNode({
        name: 'Incident Ransomware - ACME',
        nodeType: 'INCIDENT',
        severity: 'CRITICAL',
        description: 'Chiffrement des serveurs de fichiers et exfiltration de données.',
        status: 'IN_PROGRESS',
        positionX: -50,
        positionY: -20,
        color: '#666'
    });

    const vuln = LocalStorage.saveNode({
        name: 'Vulnérabilité VPN (CVE-2024-XXXX)',
        nodeType: 'VULNERABILITY',
        severity: 'HIGH',
        description: 'Exploit d’accès initial via VPN non patché.',
        status: 'OPEN',
        positionX: -220,
        positionY: -120,
        color: '#666'
    });

    const attacker = LocalStorage.saveNode({
        name: 'Groupe ShadowFox',
        nodeType: 'ATTACKER',
        severity: 'HIGH',
        description: 'Groupe d’attaque connu pour ransomware double extorsion.',
        status: 'OPEN',
        positionX: -300,
        positionY: 40,
        color: '#666'
    });

    const ioc = LocalStorage.saveNode({
        name: 'IOC - Hash b10c...f9a2',
        nodeType: 'IOC',
        severity: 'MEDIUM',
        description: 'SHA256 du binaire déployé sur les hôtes.',
        status: 'OPEN',
        positionX: 40,
        positionY: -120,
        color: '#666'
    });

    const endpoint = LocalStorage.saveNode({
        name: 'Serveur-Fichiers-01',
        nodeType: 'ENDPOINT',
        severity: 'HIGH',
        description: 'Serveur impacté (partages critiques).',
        status: 'IN_PROGRESS',
        positionX: 180,
        positionY: 10,
        color: '#666'
    });

    const malware = LocalStorage.saveNode({
        name: 'Malware - FoxCrypt',
        nodeType: 'MALWARE',
        severity: 'CRITICAL',
        description: 'Ransomware chiffrant les volumes locaux et réseau.',
        status: 'OPEN',
        positionX: 10,
        positionY: 80,
        color: '#666'
    });

    const impact = LocalStorage.saveNode({
        name: 'Impact - Arrêt Production',
        nodeType: 'IMPACT',
        severity: 'CRITICAL',
        description: 'Interruption des processus métiers pendant 12h.',
        status: 'OPEN',
        positionX: 260,
        positionY: 120,
        color: '#666'
    });

    const mitigation = LocalStorage.saveNode({
        name: 'Mitigation - Isolation réseau',
        nodeType: 'MITIGATION',
        severity: 'MEDIUM',
        description: 'Segmentation d’urgence et coupure VPN.',
        status: 'RESOLVED',
        positionX: -80,
        positionY: 160,
        color: '#666'
    });

    const evidence = LocalStorage.saveNode({
        name: 'Preuve - Logs EDR',
        nodeType: 'EVIDENCE',
        severity: 'LOW',
        description: 'Alertes EDR sur exécution anormale et chiffrement.',
        status: 'OPEN',
        positionX: 120,
        positionY: -220,
        color: '#666'
    });

    LocalStorage.saveRelation({
        sourceNode: attacker,
        targetNode: vuln,
        relationType: 'EXPLOITS',
        description: 'Exploitation de la faille pour l’accès initial.',
        confidence: 'HIGH',
        confirmed: true
    });

    LocalStorage.saveRelation({
        sourceNode: vuln,
        targetNode: incident,
        relationType: 'CAUSES',
        description: 'Vecteur initial de compromission.',
        confidence: 'HIGH',
        confirmed: true
    });

    LocalStorage.saveRelation({
        sourceNode: attacker,
        targetNode: malware,
        relationType: 'USES',
        description: 'Déploiement du ransomware FoxCrypt.',
        confidence: 'HIGH',
        confirmed: true
    });

    LocalStorage.saveRelation({
        sourceNode: malware,
        targetNode: endpoint,
        relationType: 'TARGETS',
        description: 'Cible principale du chiffrement.',
        confidence: 'HIGH',
        confirmed: true
    });

    LocalStorage.saveRelation({
        sourceNode: malware,
        targetNode: incident,
        relationType: 'TRIGGERED_BY',
        description: 'Ransomware déclenche l’incident.',
        confidence: 'HIGH',
        confirmed: true
    });

    LocalStorage.saveRelation({
        sourceNode: ioc,
        targetNode: malware,
        relationType: 'RELATED_TO',
        description: 'IOC lié au binaire malveillant.',
        confidence: 'MEDIUM',
        confirmed: true
    });

    LocalStorage.saveRelation({
        sourceNode: evidence,
        targetNode: incident,
        relationType: 'RELATED_TO',
        description: 'Preuves collectées pendant l’enquête.',
        confidence: 'MEDIUM',
        confirmed: true
    });

    LocalStorage.saveRelation({
        sourceNode: mitigation,
        targetNode: incident,
        relationType: 'MITIGATES',
        description: 'Actions de réponse pour contenir l’incident.',
        confidence: 'HIGH',
        confirmed: true
    });

    LocalStorage.saveRelation({
        sourceNode: incident,
        targetNode: impact,
        relationType: 'CAUSES',
        description: 'Conséquences métiers et opérationnelles.',
        confidence: 'HIGH',
        confirmed: true
    });
}

/**
 * Met à jour le graphe Cytoscape
 */
function updateCytoscapeGraph() {
    Utils.log('updateCytoscapeGraph - nodes:', nodes.length, 'relations:', relations.length);
    
    const cyNodes = nodes.map(node => ({
        data: {
            ...node,
            id: `node-${node.id}`,
            label: `${Utils.getNodeTypeIcon(node.nodeType)} ${node.name}`
        },
        position: {
            x: node.positionX || 0,
            y: node.positionY || 0
        }
    }));

    // Créer un Set des IDs de nœuds existants pour vérification rapide
    const nodeIds = new Set(nodes.map(n => n.id));
    Utils.log('Node IDs disponibles:', Array.from(nodeIds));

    // Filtrer les relations pour ne garder que celles dont les nœuds existent
    const validRelations = relations.filter(relation => {
        const sourceId = relation.sourceNode?.id;
        const targetId = relation.targetNode?.id;
        const hasSource = nodeIds.has(sourceId);
        const hasTarget = nodeIds.has(targetId);
        
        Utils.log(`Relation ${relation.id}: source ${sourceId} (${hasSource ? 'OK' : 'MANQUANT'}), target ${targetId} (${hasTarget ? 'OK' : 'MANQUANT'})`);
        
        if (!hasSource || !hasTarget) {
            Utils.warn(`Relation ${relation.id} ignorée: nœud manquant (source: ${sourceId}, target: ${targetId})`);
            return false;
        }
        return true;
    });

    Utils.log('Relations valides:', validRelations.length);

    const cyEdges = validRelations.map(relation => ({
        data: {
            id: `edge-${relation.id}`,
            source: `node-${relation.sourceNode.id}`,
            target: `node-${relation.targetNode.id}`,
            label: relation.relationType,
            relationType: relation.relationType,
            description: relation.description,
            confirmed: relation.confirmed,
            confidence: relation.confidence
        }
    }));

    Utils.log('Removing old elements...');
    cy.elements().remove();
    
    Utils.log('Adding', cyNodes.length, 'nodes...');
    // Ajouter d'abord les nœuds
    cy.add(cyNodes);
    
    // Vérifier que les nœuds sont bien présents
    const addedNodeIds = cy.nodes().map(n => n.id()).join(', ');
    Utils.log('Nœuds présents dans Cytoscape après ajout:', addedNodeIds);
    
    Utils.log('Adding', cyEdges.length, 'edges...');
    // Puis ajouter les edges (après que tous les nœuds soient présents)
    if (cyEdges.length > 0) {
        cyEdges.forEach((edge, idx) => {
            Utils.log(`Edge ${idx}: source=${edge.data.source}, target=${edge.data.target}`);
        });
        cy.add(cyEdges);
    }

    Utils.log('Graph updated successfully');
    
    // Appliquer les couleurs basées sur la sévérité
    nodes.forEach(node => {
        const cyNode = cy.getElementById(`node-${node.id}`);
        cyNode.style('background-color', Utils.getSeverityColor(node.severity) || node.color);
    });
}

/**
 * Met à jour les listes de sélection des nœuds
 */
function updateNodeSelects() {
    const sourceSelect = document.getElementById('relationSource');
    const targetSelect = document.getElementById('relationTarget');

    sourceSelect.innerHTML = '<option value="">Sélectionner un nœud...</option>';
    targetSelect.innerHTML = '<option value="">Sélectionner un nœud...</option>';

    nodes.forEach(node => {
        const option = document.createElement('option');
        option.value = node.id;
        option.textContent = node.name;
        sourceSelect.appendChild(option.cloneNode(true));
        targetSelect.appendChild(option.cloneNode(true));
    });
}

/**
 * Affiche les détails d'un nœud dans le side panel
 */
function showNodeDetails(nodeData) {
    const panel = document.getElementById('sidePanel');
    const content = document.getElementById('sidePanelContent');

    content.innerHTML = `
        <div class="property-item">
            <label>ID</label>
            <div style="color: #333;">${nodeData.id}</div>
        </div>
        <div class="property-item">
            <label>Nom</label>
            <input type="text" id="editNodeName" value="${nodeData.name}">
        </div>
        <div class="property-item">
            <label>Type</label>
            <div>${Utils.getNodeTypeIcon(nodeData.nodeType)} ${Utils.getNodeTypeLabel(nodeData.nodeType)}</div>
        </div>
        <div class="property-item">
            <label>Sévérité</label>
            <span class="badge badge-${nodeData.severity.toLowerCase()}">
                ${nodeData.severity}
            </span>
        </div>
        <div class="property-item">
            <label>Statut</label>
            <select id="editNodeStatus">
                <option value="OPEN" ${nodeData.status === 'OPEN' ? 'selected' : ''}>Ouvert</option>
                <option value="IN_PROGRESS" ${nodeData.status === 'IN_PROGRESS' ? 'selected' : ''}>En cours</option>
                <option value="RESOLVED" ${nodeData.status === 'RESOLVED' ? 'selected' : ''}>Résolu</option>
                <option value="CLOSED" ${nodeData.status === 'CLOSED' ? 'selected' : ''}>Fermé</option>
            </select>
        </div>
        <div class="property-item">
            <label>Description</label>
            <textarea id="editNodeDescription">${nodeData.description || ''}</textarea>
        </div>
        <div class="property-item">
            <label>Créé le</label>
            <div style="color: #666; font-size: 12px;">${new Date(nodeData.createdAt).toLocaleString('fr-FR')}</div>
        </div>
        <button class="btn btn-success" id="btnSaveNode" style="width: 100%; margin-top: 10px;">
            <i class="fas fa-save"></i> Sauvegarder
        </button>
        <button class="btn btn-danger" id="btnDeleteNode" style="width: 100%; margin-top: 10px;">
            <i class="fas fa-trash"></i> Supprimer
        </button>
        <button class="btn btn-warning" id="btnAddEvent" style="width: 100%; margin-top: 10px;">
            <i class="fas fa-clock"></i> Ajouter Événement
        </button>
        <button class="btn btn-info" id="btnShowNodeTimeline" style="width: 100%; margin-top: 10px;">
            <i class="fas fa-history"></i> Timeline
        </button>
    `;

    document.getElementById('btnSaveNode').addEventListener('click', () => saveNodeChanges(nodeData.id));
    document.getElementById('btnDeleteNode').addEventListener('click', () => deleteNodeConfirm(nodeData.id));
    document.getElementById('btnAddEvent').addEventListener('click', () => addTimelineEvent(nodeData.id));
    document.getElementById('btnShowNodeTimeline').addEventListener('click', () => showNodeTimeline(nodeData.id));

    panel.classList.add('active');
}

/**
 * Affiche les détails d'une relation
 */
function showRelationDetails(relationData) {
    const panel = document.getElementById('sidePanel');
    const content = document.getElementById('sidePanelContent');

    const sourceNode = nodes.find(n => n.id === relationData.sourceNode.id);
    const targetNode = nodes.find(n => n.id === relationData.targetNode.id);

    content.innerHTML = `
        <div class="property-item">
            <label>ID</label>
            <div style="color: #333;">${relationData.id}</div>
        </div>
        <div class="property-item">
            <label>Nœud Source</label>
            <div style="color: #333; font-weight: bold;">${sourceNode.name}</div>
        </div>
        <div class="property-item">
            <label>Nœud Cible</label>
            <div style="color: #333; font-weight: bold;">${targetNode.name}</div>
        </div>
        <div class="property-item">
            <label>Type de Relation</label>
            <div style="color: #333;">${relationData.relationType}</div>
        </div>
        <div class="property-item">
            <label>Description</label>
            <textarea id="editRelationDesc">${relationData.description || ''}</textarea>
        </div>
        <div class="property-item">
            <label>Confiance</label>
            <select id="editRelationConfidence">
                <option value="HIGH" ${relationData.confidence === 'HIGH' ? 'selected' : ''}>Haute</option>
                <option value="MEDIUM" ${relationData.confidence === 'MEDIUM' ? 'selected' : ''}>Moyenne</option>
                <option value="LOW" ${relationData.confidence === 'LOW' ? 'selected' : ''}>Basse</option>
            </select>
        </div>
        <div class="property-item">
            <label>Confirmé</label>
            <input type="checkbox" id="editRelationConfirmed" ${relationData.confirmed ? 'checked' : ''}>
        </div>
        <button class="btn btn-success" id="btnSaveRelation" style="width: 100%; margin-top: 10px;">
            <i class="fas fa-save"></i> Sauvegarder
        </button>
        <button class="btn btn-danger" id="btnDeleteRelation" style="width: 100%; margin-top: 10px;">
            <i class="fas fa-trash"></i> Supprimer
        </button>
    `;

    document.getElementById('btnSaveRelation').addEventListener('click', () => saveRelationChanges(relationData.id));
    document.getElementById('btnDeleteRelation').addEventListener('click', () => deleteRelationConfirm(relationData.id));

    panel.classList.add('active');
}

/**
 * Sauvegarde les modifications d'un nœud
 */
function saveNodeChanges(nodeId) {
    const name = document.getElementById('editNodeName').value;
    const status = document.getElementById('editNodeStatus').value;
    const description = document.getElementById('editNodeDescription').value;

    try {
        const nodeData = nodes.find(n => n.id === nodeId);
        const updatedNode = {
            ...nodeData,
            name,
            status,
            description
        };

        LocalStorage.saveNode(updatedNode);
        loadGraphData();
        Utils.showToast('Nœud mis à jour avec succès', 'success');
        document.getElementById('sidePanel').classList.remove('active');
    } catch (error) {
        Utils.error('Erreur lors de la mise à jour:', error);
        Utils.showToast('Impossible de mettre à jour le nœud', 'error');
    }
}

/**
 * Sauvegarde les modifications d'une relation
 */
function saveRelationChanges(relationId) {
    const description = document.getElementById('editRelationDesc').value;
    const confidence = document.getElementById('editRelationConfidence').value;
    const confirmed = document.getElementById('editRelationConfirmed').checked;

    try {
        const relationData = relations.find(r => r.id === relationId);
        const updatedRelation = {
            ...relationData,
            description,
            confidence,
            confirmed
        };

        LocalStorage.saveRelation(updatedRelation);
        loadGraphData();
        Utils.showToast('Relation mise à jour avec succès', 'success');
        document.getElementById('sidePanel').classList.remove('active');
    } catch (error) {
        Utils.error('Erreur lors de la mise à jour:', error);
        Utils.showToast('Impossible de mettre à jour la relation', 'error');
    }
}

/**
 * Supprime un nœud avec confirmation
 */
function deleteNodeConfirm(nodeId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce nœud ? Les relations associées seront également supprimées.')) {
        try {
            LocalStorage.deleteNode(nodeId);
            loadGraphData();
            Utils.showToast('Nœud supprimé avec succès', 'success');
            document.getElementById('sidePanel').classList.remove('active');
        } catch (error) {
            Utils.error('Erreur lors de la suppression:', error);
            Utils.showToast('Impossible de supprimer le nœud', 'error');
        }
    }
}

/**
 * Supprime une relation avec confirmation
 */
function deleteRelationConfirm(relationId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette relation ?')) {
        try {
            LocalStorage.deleteRelation(relationId);
            loadGraphData();
            Utils.showToast('Relation supprimée avec succès', 'success');
            document.getElementById('sidePanel').classList.remove('active');
        } catch (error) {
            Utils.error('Erreur lors de la suppression:', error);
            Utils.showToast('Impossible de supprimer la relation', 'error');
        }
    }
}

/**
 * Met à jour la position d'un nœud
 */
function updateNodePosition(nodeId, x, y) {
    try {
        const nodeData = nodes.find(n => n.id === parseInt(nodeId.replace('node-', '')));
        if (nodeData) {
            nodeData.positionX = x;
            nodeData.positionY = y;
            LocalStorage.saveNode(nodeData);
        }
    } catch (error) {
        Utils.error('Erreur lors de la mise à jour de la position:', error);
    }
}

/**
 * Affiche la timeline d'un nœud
 */
function showNodeTimeline(nodeId) {
    try {
        const events = LocalStorage.getTimelineEventsForNode(nodeId);
        displayTimeline(events);
    } catch (error) {
        Utils.error('Erreur lors du chargement de la timeline:', error);
        Utils.showToast('Impossible de charger la timeline', 'error');
    }
}

/**
 * Affiche la timeline
 */
function displayTimeline(events) {
    const container = document.getElementById('timelineContainer');
    const content = document.getElementById('timelineContent');

    if (events.length === 0) {
        content.innerHTML = '<p style="padding: 10px; color: #999;">Aucun événement</p>';
    } else {
        events.sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate));
        content.innerHTML = events.map(event => `
            <div class="timeline-event">
                <div class="timeline-event-time">${new Date(event.eventDate).toLocaleString('fr-FR')}</div>
                <strong>${event.title}</strong>
                <div style="margin-top: 5px; font-size: 11px;">${event.eventType}</div>
                ${event.description ? `<p style="margin: 5px 0 0 0; font-size: 11px;">${event.description}</p>` : ''}
            </div>
        `).join('');
    }

    container.classList.add('active');
}

/**
 * Ajoute un événement à la timeline
 */
function addTimelineEvent(nodeId) {
    const title = prompt('Titre de l\'événement:');
    if (!title) return;

    const description = prompt('Description (optionnel):');
    const eventType = prompt('Type (DISCOVERED, CONFIRMED, EXPLOITED, MITIGATED, ESCALATED):') || 'DISCOVERED';

    const eventData = {
        title,
        description,
        eventDate: new Date().toISOString(),
        eventType,
        evidenceNode: { id: nodeId }
    };

    try {
        LocalStorage.saveEvent(eventData);
        Utils.showToast('Événement créé avec succès', 'success');
        showNodeTimeline(nodeId);
    } catch (error) {
        Utils.error('Erreur:', error);
        Utils.showToast('Impossible de créer l\'événement', 'error');
    }
}

/**
 * Attache les écouteurs d'événements
 */
function attachEventListeners() {
    // Boutons principaux
    document.getElementById('btnAddNode').addEventListener('click', () => {
        document.getElementById('modalAddNode').classList.add('active');
    });

    document.getElementById('btnAddRelation').addEventListener('click', () => {
        document.getElementById('modalAddRelation').classList.add('active');
    });

    document.getElementById('btnLayout').addEventListener('click', reorganizeGraph);

    document.getElementById('btnTimeline').addEventListener('click', () => {
        document.getElementById('timelineContainer').classList.toggle('active');
    });

    document.getElementById('btnStatistics').addEventListener('click', showStatistics);

    document.getElementById('btnExportJSON').addEventListener('click', exportJsonReport);

    document.getElementById('btnExportHTML').addEventListener('click', exportHtmlReport);

    document.getElementById('btnSearch').addEventListener('click', searchNodes);
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchNodes();
    });

    // Drag & drop de texte brut pour créer un nœud
    const cyContainer = document.getElementById('cy');

    // Autoriser le drop globalement (sinon le navigateur bloque)
    document.addEventListener('dragover', (e) => {
        e.preventDefault();
    }, true);

    document.addEventListener('drop', (e) => {
        // Empêche l'ouverture automatique d'URL/fichiers
        e.preventDefault();
        handleTextDrop(e, cyContainer);
    }, true);

    cyContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    });

    cyContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        handleTextDrop(e, cyContainer);
    });

    // Fermeture des modals
    document.getElementById('btnCloseAddNode').addEventListener('click', () => {
        document.getElementById('modalAddNode').classList.remove('active');
    });

    document.getElementById('btnCloseAddRelation').addEventListener('click', () => {
        document.getElementById('modalAddRelation').classList.remove('active');
    });

    document.getElementById('btnCloseStatistics').addEventListener('click', () => {
        document.getElementById('modalStatistics').classList.remove('active');
    });

    document.getElementById('btnCloseSidePanel').addEventListener('click', () => {
        document.getElementById('sidePanel').classList.remove('active');
    });

    document.getElementById('btnCloseTimeline').addEventListener('click', () => {
        document.getElementById('timelineContainer').classList.remove('active');
    });

    // Formulaires
    document.getElementById('formAddNode').addEventListener('submit', handleAddNode);
    document.getElementById('formAddRelation').addEventListener('submit', handleAddRelation);
}

/**
 * Gère l'ajout d'un nouveau nœud
 */
function handleAddNode(e) {
    e.preventDefault();

    const nodeTypeValue = document.getElementById('nodeType')?.value || 'BUG';
    const severityValue = document.getElementById('nodeSeverity')?.value || 'LOW';
    const statusValue = document.getElementById('nodeStatus')?.value || 'OPEN';

    const nodeData = {
        name: document.getElementById('nodeeName').value,
        nodeType: nodeTypeValue,
        severity: severityValue,
        description: document.getElementById('nodeDescription').value,
        status: statusValue,
        positionX: 0,
        positionY: 0,
        color: '#666'
    };

    try {
        LocalStorage.saveNode(nodeData);
        document.getElementById('formAddNode').reset();
        document.getElementById('modalAddNode').classList.remove('active');
        loadGraphData();
        Utils.showToast('Nœud créé avec succès', 'success');
    } catch (error) {
        Utils.error('Erreur:', error);
        Utils.showToast(`Erreur: ${error?.message || 'Impossible de créer le nœud'}`, 'error');
    }
}

/**
 * Gère l'ajout d'une nouvelle relation
 */
function handleAddRelation(e) {
    e.preventDefault();

    const sourceId = parseInt(document.getElementById('relationSource').value);
    const targetId = parseInt(document.getElementById('relationTarget').value);

    if (!sourceId || !targetId || sourceId === targetId) {
        Utils.showToast('Veuillez sélectionner deux nœuds différents', 'warning');
        return;
    }

    const sourceNode = nodes.find(n => n.id === sourceId);
    const targetNode = nodes.find(n => n.id === targetId);

    const relationData = {
        sourceNode: sourceNode,
        targetNode: targetNode,
        relationType: document.getElementById('relationType').value,
        description: document.getElementById('relationDescription').value,
        confidence: document.getElementById('relationConfidence').value,
        confirmed: false
    };

    try {
        LocalStorage.saveRelation(relationData);
        document.getElementById('formAddRelation').reset();
        document.getElementById('modalAddRelation').classList.remove('active');
        loadGraphData();
        Utils.showToast('Relation créée avec succès', 'success');
    } catch (error) {
        Utils.error('Erreur:', error);
        Utils.showToast('Impossible de créer la relation', 'error');
    }
}

/**
 * Crée un nœud à partir d'un texte brut (drag & drop)
 */
function createNodeFromText(text, position) {
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    const name = lines[0] || 'Nouveau nœud';
    const description = lines.slice(1).join('\n');

    const nodeData = {
        name,
        nodeType: 'BUG',
        severity: 'LOW',
        description,
        status: 'OPEN',
        positionX: position?.x || 0,
        positionY: position?.y || 0,
        color: '#666'
    };

    try {
        LocalStorage.saveNode(nodeData);
        loadGraphData();
        Utils.showToast('Nœud créé depuis le texte', 'success');
    } catch (error) {
        Utils.error('Erreur lors de la création du nœud:', error);
        Utils.showToast('Impossible de créer le nœud', 'error');
    }
}

/**
 * Calcule la position du drop en coordonnées du graphe
 */
function getDropGraphPosition(event, container) {
    const rect = container.getBoundingClientRect();
    const renderedX = event.clientX - rect.left;
    const renderedY = event.clientY - rect.top;
    const zoom = cy.zoom();
    const pan = cy.pan();

    return {
        x: (renderedX - pan.x) / zoom,
        y: (renderedY - pan.y) / zoom
    };
}

/**
 * Traite le drop de texte brut sur le graphe
 */
async function handleTextDrop(event, container) {
    const path = event.composedPath ? event.composedPath() : [];
    const isInside = path.includes(container) || container.contains(event.target);
    if (!isInside) return;

    const text = (await extractDropText(event.dataTransfer)).trim();
    if (!text) {
        Utils.showToast('Déposez du texte brut pour créer un nœud', 'info');
        return;
    }

    const position = getDropGraphPosition(event, container);
    createNodeFromText(text, position);
}

/**
 * Extrait le texte depuis un DataTransfer (texte, HTML, fichier)
 */
async function extractDropText(dataTransfer) {
    if (!dataTransfer) return '';

    const plain = dataTransfer.getData('text/plain') || dataTransfer.getData('text') || '';
    if (plain && plain.trim()) return plain;

    const uriList = dataTransfer.getData('text/uri-list') || '';
    if (uriList && uriList.trim()) {
        const firstUrl = uriList.split('\n').find(line => line.trim() && !line.startsWith('#')) || '';
        if (firstUrl) return firstUrl.trim();
    }

    const mozUrl = dataTransfer.getData('text/x-moz-url') || '';
    if (mozUrl && mozUrl.trim()) {
        const parts = mozUrl.split('\n').map(p => p.trim()).filter(Boolean);
        if (parts.length) return parts.join('\n');
    }

    const html = dataTransfer.getData('text/html') || '';
    if (html && html.trim()) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        const text = tmp.textContent || tmp.innerText || '';
        if (text && text.trim()) return text;
    }

    if (dataTransfer.items && dataTransfer.items.length) {
        for (const item of dataTransfer.items) {
            if (item.kind === 'string' && item.type.startsWith('text')) {
                const value = await new Promise(resolve => item.getAsString(resolve));
                if (value && value.trim()) return value;
            }
        }
    }

    if (dataTransfer.files && dataTransfer.files.length) {
        const file = dataTransfer.files[0];
        return readFileAsText(file);
    }

    return '';
}

/**
 * Lit un fichier en texte
 */
function readFileAsText(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => resolve('');
        reader.readAsText(file);
    });
}

/**
 * Réorganise le graphe
 */
function reorganizeGraph() {
    cy.layout({
        name: 'cose',
        animate: true,
        animationDuration: 500,
        randomize: false,
        idealEdgeLength: 100,
        nodeOverlap: 20,
        refresh: 20,
        fit: true,
        padding: 30
    }).run();
}

/**
 * Affiche les statistiques
 */
function showStatistics() {
    try {
        // Calculer les statistiques depuis les données locales
        const stats = {
            totalNodes: nodes.length,
            totalRelations: relations.length,
            nodesBySeverity: {
                CRITICAL: nodes.filter(n => n.severity === 'CRITICAL').length,
                HIGH: nodes.filter(n => n.severity === 'HIGH').length,
                MEDIUM: nodes.filter(n => n.severity === 'MEDIUM').length,
                LOW: nodes.filter(n => n.severity === 'LOW').length,
                INFO: nodes.filter(n => n.severity === 'INFO').length
            },
            nodesByStatus: {
                OPEN: nodes.filter(n => n.status === 'OPEN').length,
                IN_PROGRESS: nodes.filter(n => n.status === 'IN_PROGRESS').length,
                RESOLVED: nodes.filter(n => n.status === 'RESOLVED').length,
                CLOSED: nodes.filter(n => n.status === 'CLOSED').length
            }
        };

        const modal = document.getElementById('modalStatistics');
        const content = document.getElementById('statisticsContent');

        content.innerHTML = `
            <div style="padding: 20px;">
                <h3 style="margin-top: 0;">Vue d'ensemble</h3>
                <div style="background: #f0f0f0; padding: 15px; border-radius: 5px; margin-bottom: 20px; color: black;">
                    <p><strong>Nombre total de nœuds:</strong> ${stats.totalNodes}</p>
                    <p><strong>Nombre total de relations:</strong> ${stats.totalRelations}</p>
                </div>

                <h3>Par Sévérité</h3>
                <div style="background: #f0f0f0; padding: 15px; border-radius: 5px; margin-bottom: 20px; color: black;">
                    <p><span class="badge badge-critical">CRITIQUE</span> ${stats.nodesBySeverity.CRITICAL}</p>
                    <p><span class="badge badge-high">HAUT</span> ${stats.nodesBySeverity.HIGH}</p>
                    <p><span class="badge badge-medium">MOYEN</span> ${stats.nodesBySeverity.MEDIUM}</p>
                    <p><span class="badge badge-low">BAS</span> ${stats.nodesBySeverity.LOW}</p>
                    <p><span class="badge badge-info">INFO</span> ${stats.nodesBySeverity.INFO}</p>
                </div>

                <h3>Par Statut</h3>
                <div style="background: #f0f0f0; padding: 15px; border-radius: 5px; color: black;">
                    <p><strong>Ouverts:</strong> ${stats.nodesByStatus.OPEN}</p>
                    <p><strong>En cours:</strong> ${stats.nodesByStatus.IN_PROGRESS}</p>
                    <p><strong>Résolus:</strong> ${stats.nodesByStatus.RESOLVED}</p>
                    <p><strong>Fermés:</strong> ${stats.nodesByStatus.CLOSED}</p>
                </div>
            </div>
        `;

        modal.classList.add('active');
    } catch (error) {
        Utils.error('Erreur:', error);
        Utils.showToast('Impossible de charger les statistiques', 'error');
    }
}

/**
 * Recherche les nœuds
 */
function searchNodes() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    if (!searchTerm) {
        clearSearch();
        return;
    }

    cy.elements().removeClass('highlighted');
    
    const foundNodes = nodes.filter(node => 
        node.name.toLowerCase().includes(searchTerm) ||
        (node.description && node.description.toLowerCase().includes(searchTerm))
    );

    foundNodes.forEach(node => {
        cy.getElementById(`node-${node.id}`).addClass('highlighted');
    });

    if (foundNodes.length === 0) {
        Utils.showToast('Aucun nœud trouvé', 'info');
    }
}

/**
 * Efface la recherche
 */
function clearSearch() {
    document.getElementById('searchInput').value = '';
    cy.elements().removeClass('highlighted');
}

/**
 * Affiche/cache le spinner de chargement
 */
function showLoadingSpinner(show) {
    const spinner = document.getElementById('loadingSpinner');
    if (show) {
        spinner.classList.add('active');
    } else {
        spinner.classList.remove('active');
    }
}

/**
 * Télécharge un blob
 */
function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Exporte les données en JSON
 */
function exportJsonReport() {
    const data = LocalStorage.exportData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    downloadBlob(blob, 'detectivedex-export.json');
    Utils.showToast('Export JSON réussi', 'success');
}

/**
 * Exporte les données en HTML
 */
function exportHtmlReport() {
    const data = LocalStorage.exportData();
    const timestamp = new Date().toLocaleString('fr-FR');

    let html = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapport DetectiveDex</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #0b1118;
            color: #e0e0e0;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background-color: #0f1720;
            padding: 30px;
            border-radius: 8px;
            border-left: 4px solid #00d1ff;
        }
        h1 { color: #00d1ff; border-bottom: 2px solid #7c3aed; padding-bottom: 10px; }
        h2 { color: #7c3aed; margin-top: 30px; }
        h3 { color: #00d1ff; margin-top: 20px; }
        .badge {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 3px;
            font-size: 12px;
            font-weight: bold;
            margin-right: 5px;
        }
        .badge-critical { background-color: #d32f2f; color: white; }
        .badge-high { background-color: #f57c00; color: white; }
        .badge-medium { background-color: #fbc02d; color: black; }
        .badge-low { background-color: #388e3c; color: white; }
        .badge-info { background-color: #1976d2; color: white; }
        .node, .relation, .event {
            background-color: #1a2332;
            padding: 15px;
            margin: 10px 0;
            border-radius: 5px;
            border-left: 3px solid #00d1ff;
        }
        .timestamp { color: #999; font-size: 12px; }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        th, td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #333;
        }
        th {
            background-color: #1a2332;
            color: #00d1ff;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 Rapport DetectiveDex</h1>
        <p class="timestamp">Généré le: ${timestamp}</p>
        
        <h2>📈 Statistiques Globales</h2>
        <p><strong>Nombre total de nœuds:</strong> ${data.nodes.length}</p>
        <p><strong>Nombre total de relations:</strong> ${data.relations.length}</p>
        <p><strong>Nombre total d'événements:</strong> ${data.events.length}</p>

        <h2>🔴 Nœuds (${data.nodes.length})</h2>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nom</th>
                    <th>Type</th>
                    <th>Sévérité</th>
                    <th>Statut</th>
                    <th>Description</th>
                </tr>
            </thead>
            <tbody>
    `;

    data.nodes.forEach(node => {
        const severityBadge = `<span class="badge badge-${node.severity.toLowerCase()}">${node.severity}</span>`;
        html += `
                <tr>
                    <td>${node.id}</td>
                    <td><strong>${Utils.escapeHtml(node.name)}</strong></td>
                    <td>${Utils.getNodeTypeLabel(node.nodeType)}</td>
                    <td>${severityBadge}</td>
                    <td>${node.status}</td>
                    <td>${Utils.escapeHtml(node.description || '')}</td>
                </tr>
        `;
    });

    html += `
            </tbody>
        </table>

        <h2>🔗 Relations (${data.relations.length})</h2>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Source</th>
                    <th>Cible</th>
                    <th>Type</th>
                    <th>Confiance</th>
                    <th>Confirmée</th>
                </tr>
            </thead>
            <tbody>
    `;

    data.relations.forEach(relation => {
        const sourceName = data.nodes.find(n => n.id === relation.sourceNode?.id)?.name || 'N/A';
        const targetName = data.nodes.find(n => n.id === relation.targetNode?.id)?.name || 'N/A';
        const confirmed = relation.confirmed ? '✓' : '✗';
        html += `
                <tr>
                    <td>${relation.id}</td>
                    <td>${Utils.escapeHtml(sourceName)}</td>
                    <td>${Utils.escapeHtml(targetName)}</td>
                    <td>${relation.relationType}</td>
                    <td>${relation.confidence}</td>
                    <td>${confirmed}</td>
                </tr>
        `;
    });

    html += `
            </tbody>
        </table>

        <h2>📅 Événements (${data.events.length})</h2>
    `;

    data.events.forEach(event => {
        const nodeName = data.nodes.find(n => n.id === event.evidenceNode?.id)?.name || 'N/A';
        html += `
        <div class="event">
            <strong>${Utils.escapeHtml(event.title)}</strong>
            <p><strong>Nœud:</strong> ${Utils.escapeHtml(nodeName)}</p>
            <p><strong>Type:</strong> ${event.eventType}</p>
            <p><strong>Date:</strong> ${new Date(event.eventDate).toLocaleString('fr-FR')}</p>
            ${event.description ? `<p><strong>Description:</strong> ${Utils.escapeHtml(event.description)}</p>` : ''}
        </div>
        `;
    });

    html += `
    </div>
</body>
</html>
    `;

    const blob = new Blob([html], { type: 'text/html' });
    downloadBlob(blob, 'detectivedex-report.html');
    Utils.showToast('Export HTML réussi', 'success');
}
