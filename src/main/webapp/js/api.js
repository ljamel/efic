/**
 * Module API - Gère la communication avec le backend REST
 */

const API_BASE_URL = 'http://localhost:8080/detectivedex/api';

// Helper function for error handling
async function handleFetch(response) {
    const text = await response.text();
    if (!response.ok) {
        throw new Error(text || `HTTP ${response.status}`);
    }
    return text ? JSON.parse(text) : null;
}

const API = {
    // ============== NODES ==============
    
    getAllNodes() {
        return fetch(`${API_BASE_URL}/nodes`)
            .then(handleFetch);
    },

    getNodeById(id) {
        return fetch(`${API_BASE_URL}/nodes/${id}`)
            .then(handleFetch);
    },

    createNode(nodeData) {
        return fetch(`${API_BASE_URL}/nodes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nodeData)
        }).then(handleFetch);
    },

    updateNode(id, nodeData) {
        return fetch(`${API_BASE_URL}/nodes/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nodeData)
        }).then(handleFetch);
    },

    deleteNode(id) {
        return fetch(`${API_BASE_URL}/nodes/${id}`, {
            method: 'DELETE'
        }).then(handleFetch);
    },

    getNodesByType(type) {
        return fetch(`${API_BASE_URL}/nodes/type/${type}`)
            .then(handleFetch);
    },

    getNodesBySeverity(severity) {
        return fetch(`${API_BASE_URL}/nodes/severity/${severity}`)
            .then(handleFetch);
    },

    getNodesByStatus(status) {
        return fetch(`${API_BASE_URL}/nodes/status/${status}`)
            .then(handleFetch);
    },

    // ============== RELATIONS ==============

    getAllRelations() {
        return fetch(`${API_BASE_URL}/relations`)
            .then(handleFetch);
    },

    getRelationById(id) {
        return fetch(`${API_BASE_URL}/relations/${id}`)
            .then(handleFetch);
    },

    createRelation(relationData) {
        return fetch(`${API_BASE_URL}/relations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(relationData)
        }).then(handleFetch);
    },

    updateRelation(id, relationData) {
        return fetch(`${API_BASE_URL}/relations/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(relationData)
        }).then(handleFetch);
    },

    deleteRelation(id) {
        return fetch(`${API_BASE_URL}/relations/${id}`, {
            method: 'DELETE'
        }).then(handleFetch);
    },

    getRelationsFromNode(sourceId) {
        return fetch(`${API_BASE_URL}/relations/from/${sourceId}`)
            .then(handleFetch);
    },

    getRelationsToNode(targetId) {
        return fetch(`${API_BASE_URL}/relations/to/${targetId}`)
            .then(handleFetch);
    },

    getRelationsByType(type) {
        return fetch(`${API_BASE_URL}/relations/type/${type}`)
            .then(handleFetch);
    },

    // ============== TIMELINE ==============

    getAllTimelineEvents() {
        return fetch(`${API_BASE_URL}/timeline`)
            .then(handleFetch);
    },

    getTimelineEventById(id) {
        return fetch(`${API_BASE_URL}/timeline/${id}`)
            .then(handleFetch);
    },

    createTimelineEvent(eventData) {
        return fetch(`${API_BASE_URL}/timeline`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(eventData)
        }).then(handleFetch);
    },

    updateTimelineEvent(id, eventData) {
        return fetch(`${API_BASE_URL}/timeline/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(eventData)
        }).then(handleFetch);
    },

    deleteTimelineEvent(id) {
        return fetch(`${API_BASE_URL}/timeline/${id}`, {
            method: 'DELETE'
        }).then(handleFetch);
    },

    getTimelineEventsForNode(nodeId) {
        return fetch(`${API_BASE_URL}/timeline/node/${nodeId}`)
            .then(handleFetch);
    },

    getTimelineEventsByType(type) {
        return fetch(`${API_BASE_URL}/timeline/type/${type}`)
            .then(handleFetch);
    },

    // ============== REPORTS ==============

    exportJsonReport() {
        return fetch(`${API_BASE_URL}/reports/export/json`)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response.blob();
            });
    },

    exportHtmlReport() {
        return fetch(`${API_BASE_URL}/reports/export/html`)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response.blob();
            });
    },

    getStatistics() {
        return fetch(`${API_BASE_URL}/reports/statistics`)
            .then(handleFetch);
    }
};
