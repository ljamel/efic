/**
 * D3FEND Feature Module (optional)
 * Isolated by design: no side effects when disabled.
 */

const D3FEND = {
    isEnabled() {
        return typeof AppConfig !== 'undefined' && AppConfig.d3fend?.enabled === true;
    },

    isD3fendNode(node) {
        return Boolean(node?.d3fend_id);
    },

    getTechnique(id) {
        return AppConfig?.d3fend?.techniques?.[id] || null;
    },

    buildTechniqueNode(technique, position = { x: 0, y: 0 }) {
        if (!technique) return null;
        return {
            name: technique.name,
            nodeType: AppConfig.d3fend.nodeType,
            severity: 'INFO',
            description: technique.description,
            status: 'OPEN',
            d3fend_id: technique.d3fend_id,
            category: technique.category,
            related_attack_ids: technique.related_attack_ids,
            positionX: position.x,
            positionY: position.y,
            color: AppConfig.d3fend.color
        };
    },

    getTooltipText(node) {
        if (!node?.d3fend_id) return '';
        return `${node.d3fend_id} — ${node.name}`;
    }
};
