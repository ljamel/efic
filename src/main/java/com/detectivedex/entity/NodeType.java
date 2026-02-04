package com.detectivedex.entity;

/**
 * Énumération des types de nœuds possibles
 */
public enum NodeType {
    BUG("Bug"),
    VULNERABILITY("Vulnérabilité"),
    INCIDENT("Incident"),
    ARTIFACT("Artefact"),
    ENDPOINT("Endpoint"),
    ATTACKER("Attaquant"),
    MALWARE("Malware"),
    IOC("Indicateur de Compromission"),
    IMPACT("Impact"),
    MITIGATION("Mitigation"),
    EVIDENCE("Preuve"),
    ACTOR("Acteur"),
    DEFENSIVE_TECHNIQUE("Defensive Technique (D3FEND)");

    private final String label;

    NodeType(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
