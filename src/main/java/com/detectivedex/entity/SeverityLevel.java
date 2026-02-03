package com.detectivedex.entity;

/**
 * Énumération des niveaux de sévérité
 */
public enum SeverityLevel {
    CRITICAL("Critique", 5, "#e74c3c"),
    HIGH("Haut", 4, "#e67e22"),
    MEDIUM("Moyen", 3, "#f39c12"),
    LOW("Bas", 2, "#3498db"),
    INFO("Information", 1, "#95a5a6");

    private final String label;
    private final int score;
    private final String defaultColor;

    SeverityLevel(String label, int score, String defaultColor) {
        this.label = label;
        this.score = score;
        this.defaultColor = defaultColor;
    }

    public String getLabel() {
        return label;
    }

    public int getScore() {
        return score;
    }

    public String getDefaultColor() {
        return defaultColor;
    }
}
