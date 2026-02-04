/**
 * Utility Functions Module
 * Common utility functions used across the application
 * By ingenius via github ljamel
 */

const Utils = {
    /**
     * Conditional logging - only logs if debug mode is enabled
     * @param {...any} args - Arguments to log
     */
    log(...args) {
        if (AppConfig.debug) {
            console.log(...args);
        }
    },

    /**
     * Conditional warning - only logs if debug mode is enabled
     * @param {...any} args - Arguments to log
     */
    warn(...args) {
        if (AppConfig.debug) {
            console.warn(...args);
        }
    },

    /**
     * Error logging - always logs errors
     * @param {...any} args - Arguments to log
     */
    error(...args) {
        console.error(...args);
    },

    /**
     * Debounce function to limit function calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, wait = AppConfig.ui.debounceDelay) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Format date to locale string
     * @param {Date|string} date - Date to format
     * @returns {string} Formatted date string
     */
    formatDate(date) {
        if (!date) return 'N/A';
        const dateObj = date instanceof Date ? date : new Date(date);
        return dateObj.toLocaleString('fr-FR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    /**
     * Show toast notification
     * @param {string} message - Message to display
     * @param {string} type - Type of toast (success, error, info, warning)
     */
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${this.getToastColor(type)};
            color: white;
            border-radius: 4px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, AppConfig.ui.toastDuration);
    },

    /**
     * Get toast color based on type
     * @param {string} type - Toast type
     * @returns {string} Color hex code
     */
    getToastColor(type) {
        const colors = {
            success: '#48bb78',
            error: '#e74c3c',
            warning: '#f39c12',
            info: '#3498db'
        };
        return colors[type] || colors.info;
    },

    /**
     * Sanitize HTML to prevent XSS
     * @param {string} str - String to sanitize
     * @returns {string} Sanitized string
     */
    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    /**
     * Deep clone an object
     * @param {Object} obj - Object to clone
     * @returns {Object} Cloned object
     */
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    /**
     * Generate a unique ID
     * @returns {string} Unique identifier
     */
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} True if valid
     */
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    /**
     * Get severity color
     * @param {string} severity - Severity level
     * @returns {string} Color hex code
     */
    getSeverityColor(severity) {
        return AppConfig.severity[severity]?.color || '#95a5a6';
    },

    /**
     * Get severity label
     * @param {string} severity - Severity level
     * @returns {string} Localized label
     */
    getSeverityLabel(severity) {
        return AppConfig.severity[severity]?.label || severity;
    },

    /**
     * Get node type icon
     * @param {string} nodeType - Node type
     * @returns {string} Visual icon
     */
    getNodeTypeIcon(nodeType) {
        const iconMap = {
            BUG: '⬢',
            VULNERABILITY: '⛨',
            INCIDENT: '▲',
            ARTIFACT: '■',
            ENDPOINT: '◇',
            ATTACKER: '⟡',
            MALWARE: '☣',
            IOC: '◎',
            IMPACT: '✶',
            MITIGATION: '⛉',
            EVIDENCE: '▣',
            ACTOR: '◯'
        };
        return iconMap[nodeType] || '•';
    },

    /**
     * Get node type label
     * @param {string} nodeType - Node type
     * @returns {string} Localized label
     */
    getNodeTypeLabel(nodeType) {
        return AppConfig.nodeTypes[nodeType]?.label || nodeType;
    },

    /**
     * Check if object is empty
     * @param {Object} obj - Object to check
     * @returns {boolean} True if empty
     */
    isEmpty(obj) {
        return Object.keys(obj).length === 0;
    },

    /**
     * Truncate string with ellipsis
     * @param {string} str - String to truncate
     * @param {number} maxLength - Maximum length
     * @returns {string} Truncated string
     */
    truncate(str, maxLength = 50) {
        if (!str || str.length <= maxLength) return str;
        return str.substring(0, maxLength) + '...';
    },

    /**
     * Export data as JSON file
     * @param {Object} data - Data to export
     * @param {string} filename - Output filename
     */
    exportJSON(data, filename = 'export.json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { 
            type: 'application/json' 
        });
        this.downloadBlob(blob, filename);
    },

    /**
     * Export data as HTML file
     * @param {string} html - HTML content
     * @param {string} filename - Output filename
     */
    exportHTML(html, filename = 'export.html') {
        const blob = new Blob([html], { type: 'text/html' });
        this.downloadBlob(blob, filename);
    },

    /**
     * Download a blob as file
     * @param {Blob} blob - Blob to download
     * @param {string} filename - Output filename
     */
    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    /**
     * Group array items by key
     * @param {Array} array - Array to group
     * @param {string} key - Key to group by
     * @returns {Object} Grouped object
     */
    groupBy(array, key) {
        return array.reduce((result, item) => {
            const group = item[key];
            result[group] = result[group] || [];
            result[group].push(item);
            return result;
        }, {});
    },

    /**
     * Sort array by multiple properties
     * @param {Array} array - Array to sort
     * @param {Array} properties - Properties to sort by
     * @returns {Array} Sorted array
     */
    sortBy(array, properties) {
        return array.sort((a, b) => {
            for (const prop of properties) {
                const direction = prop.startsWith('-') ? -1 : 1;
                const key = prop.replace(/^-/, '');
                
                if (a[key] < b[key]) return -1 * direction;
                if (a[key] > b[key]) return 1 * direction;
            }
            return 0;
        });
    }
};

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}
