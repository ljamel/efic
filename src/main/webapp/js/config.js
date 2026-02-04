/**
 * Configuration Module
 * Centralized configuration for the DetectiveDex application
 */

const AppConfig = {
    // Environment Configuration
    debug: true, // Set to false in production
    
    // API Configuration
    api: {
        baseUrl: '/api',
        endpoints: {
            nodes: '/nodes',
            relations: '/relations',
            timeline: '/timeline',
            reports: '/reports'
        },
        timeout: 30000
    },
    
    // Cytoscape Configuration
    cytoscape: {
        style: [
            {
                selector: 'node',
                style: {
                    'background-color': 'data(color)',
                    'label': 'data(label)',
                    'color': '#fff',
                    'text-valign': 'center',
                    'text-halign': 'center',
                    'font-size': '12px',
                    'font-weight': 'bold',
                    'text-outline-width': 2,
                    'text-outline-color': '#333',
                    'width': '60px',
                    'height': '60px',
                    'border-width': 2,
                    'border-color': '#fff',
                    'overlay-padding': '6px',
                    'z-index': 10
                }
            },
            {
                selector: '.d3fend',
                style: {
                    'background-color': '#2dd4bf',
                    'border-color': '#2dd4bf',
                    'text-outline-color': '#0b1118'
                }
            },
            {
                selector: 'node:selected',
                style: {
                    'border-width': 4,
                    'border-color': '#FFD700',
                    'background-color': 'data(color)',
                    'z-index': 999
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 3,
                    'line-color': '#9dbaea',
                    'target-arrow-color': '#9dbaea',
                    'target-arrow-shape': 'triangle',
                    'curve-style': 'bezier',
                    'arrow-scale': 1.5,
                    'label': 'data(label)',
                    'font-size': '10px',
                    'text-rotation': 'autorotate',
                    'text-margin-y': -10,
                    'color': '#fff',
                    'text-outline-width': 1.5,
                    'text-outline-color': '#333'
                }
            },
            {
                selector: 'edge:selected',
                style: {
                    'line-color': '#FFD700',
                    'target-arrow-color': '#FFD700',
                    'width': 4
                }
            },
            {
                selector: '.highlighted',
                style: {
                    'background-color': '#FFD700',
                    'line-color': '#FFD700',
                    'target-arrow-color': '#FFD700',
                    'transition-property': 'background-color, line-color, target-arrow-color',
                    'transition-duration': '0.5s'
                }
            }
        ],
        
        layout: {
            name: 'cose',
            animate: true,
            animationDuration: 500,
            fit: true,
            padding: 30,
            nodeRepulsion: 8000,
            idealEdgeLength: 100,
            edgeElasticity: 100,
            nestingFactor: 5,
            gravity: 80,
            numIter: 1000,
            initialTemp: 200,
            coolingFactor: 0.95,
            minTemp: 1.0
        }
    },
    
    // Severity Configuration
    severity: {
        CRITICAL: {
            color: '#e74c3c',
            label: 'Critique',
            priority: 5
        },
        HIGH: {
            color: '#e67e22',
            label: 'Haut',
            priority: 4
        },
        MEDIUM: {
            color: '#f39c12',
            label: 'Moyen',
            priority: 3
        },
        LOW: {
            color: '#3498db',
            label: 'Bas',
            priority: 2
        },
        INFO: {
            color: '#95a5a6',
            label: 'Information',
            priority: 1
        }
    },
    
    // Node Type Configuration
    nodeTypes: {
        BUG: { label: 'Bug', icon: 'fa-bug' },
        VULNERABILITY: { label: 'Vulnérabilité', icon: 'fa-shield-virus' },
        INCIDENT: { label: 'Incident', icon: 'fa-exclamation-triangle' },
        ARTIFACT: { label: 'Artefact', icon: 'fa-file' },
        ENDPOINT: { label: 'Endpoint', icon: 'fa-desktop' },
        ATTACKER: { label: 'Attaquant', icon: 'fa-user-secret' },
        MALWARE: { label: 'Malware', icon: 'fa-virus' },
        IOC: { label: 'IOC', icon: 'fa-fingerprint' },
        IMPACT: { label: 'Impact', icon: 'fa-chart-line' },
        MITIGATION: { label: 'Mitigation', icon: 'fa-shield-alt' },
        EVIDENCE: { label: 'Preuve', icon: 'fa-file-contract' },
        ACTOR: { label: 'Acteur', icon: 'fa-user' },
        DEFENSIVE_TECHNIQUE: { label: 'Defensive Technique (D3FEND)', icon: 'fa-shield' }
    },
    
    // Relation Type Configuration
    relationTypes: {
        CAUSES: { label: 'Cause', color: '#e74c3c' },
        RELATED_TO: { label: 'Lié à', color: '#3498db' },
        EXPLOITS: { label: 'Exploite', color: '#e67e22' },
        TRIGGERED_BY: { label: 'Déclenché par', color: '#9b59b6' },
        MITIGATES: { label: 'Atténue', color: '#27ae60' },
        DEPENDS_ON: { label: 'Dépend de', color: '#f39c12' },
        TARGETS: { label: 'Cible', color: '#c0392b' },
        USES: { label: 'Utilise', color: '#16a085' },
        DETECTS: { label: 'Détecte', color: '#2dd4bf' },
        PREVENTS: { label: 'Prévient', color: '#22c55e' },
        RESPONDS_TO: { label: 'Répond à', color: '#38bdf8' },
        PROTECTS: { label: 'Protège', color: '#a78bfa' },
        SUPPORTS: { label: 'Soutient', color: '#94a3b8' }
    },

    // MITRE D3FEND (optional)
    d3fend: {
        enabled: true,
        nodeType: 'DEFENSIVE_TECHNIQUE',
        color: '#2dd4bf',
        icon: '🛡️',
        categories: ['Detection', 'Prevention', 'Response'],
        techniques: {
            'D3-EDR': {
                d3fend_id: 'D3-EDR',
                name: 'Endpoint Detection and Response',
                category: 'Detection',
                description: 'Surveillance et détection des activités malveillantes sur les endpoints.',
                related_attack_ids: ['T1059']
            },
            'D3-MDE': {
                d3fend_id: 'D3-MDE',
                name: 'Malware Detection',
                category: 'Detection',
                description: 'Détection de logiciels malveillants par analyse comportementale et signatures.',
                related_attack_ids: ['T1204']
            },
            'D3-NDS': {
                d3fend_id: 'D3-NDS',
                name: 'Network Traffic Segmentation',
                category: 'Prevention',
                description: 'Segmentation du trafic pour limiter la propagation latérale.',
                related_attack_ids: ['TA0008']
            },
            'D3-IOC': {
                d3fend_id: 'D3-IOC',
                name: 'Indicator of Compromise Analysis',
                category: 'Detection',
                description: 'Analyse d’IOC pour détecter des compromissions actives.',
                related_attack_ids: ['T1070']
            },
            'D3-IR': {
                d3fend_id: 'D3-IR',
                name: 'Incident Response',
                category: 'Response',
                description: 'Processus de réponse pour contenir et éradiquer un incident.',
                related_attack_ids: ['TA0001']
            }
        }
    },
    
    // UI Configuration
    ui: {
        animationDuration: 300,
        debounceDelay: 300,
        toastDuration: 3000
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppConfig;
}
