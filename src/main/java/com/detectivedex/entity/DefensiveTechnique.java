package com.detectivedex.entity;

import java.io.Serializable;
import java.util.List;

/**
 * Modèle D3FEND (optionnel)
 * Représente une technique défensive MITRE D3FEND.
 */
public class DefensiveTechnique implements Serializable {
    private String d3fendId;
    private String name;
    private String category; // Detection | Prevention | Response
    private String description;
    private List<String> relatedAttackIds; // TAxxxx / Txxxx

    public DefensiveTechnique() {
    }

    public DefensiveTechnique(String d3fendId, String name, String category, String description, List<String> relatedAttackIds) {
        this.d3fendId = d3fendId;
        this.name = name;
        this.category = category;
        this.description = description;
        this.relatedAttackIds = relatedAttackIds;
    }

    public String getD3fendId() {
        return d3fendId;
    }

    public void setD3fendId(String d3fendId) {
        this.d3fendId = d3fendId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<String> getRelatedAttackIds() {
        return relatedAttackIds;
    }

    public void setRelatedAttackIds(List<String> relatedAttackIds) {
        this.relatedAttackIds = relatedAttackIds;
    }
}
