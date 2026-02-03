package com.detectivedex.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Entité représentant une relation entre deux nœuds
 */
@Entity
@Table(name = "relations")
public class Relation implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, cascade = CascadeType.REFRESH)
    @JoinColumn(name = "source_node_id", nullable = false)
    private EvidenceNode sourceNode;

    @ManyToOne(fetch = FetchType.EAGER, cascade = CascadeType.REFRESH)
    @JoinColumn(name = "target_node_id", nullable = false)
    private EvidenceNode targetNode;

    @Column(nullable = false, length = 100)
    private String relationType; // CAUSES, RELATED_TO, EXPLOITS, TRIGGERED_BY, MITIGATES, etc.

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private Boolean confirmed = false;

    @Column(length = 50)
    private String confidence; // HIGH, MEDIUM, LOW

    // Constructeurs
    public Relation() {
        this.createdAt = LocalDateTime.now();
    }

    public Relation(EvidenceNode sourceNode, EvidenceNode targetNode, String relationType) {
        this();
        this.sourceNode = sourceNode;
        this.targetNode = targetNode;
        this.relationType = relationType;
    }

    // Getters et Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public EvidenceNode getSourceNode() {
        return sourceNode;
    }

    public void setSourceNode(EvidenceNode sourceNode) {
        this.sourceNode = sourceNode;
    }

    public EvidenceNode getTargetNode() {
        return targetNode;
    }

    public void setTargetNode(EvidenceNode targetNode) {
        this.targetNode = targetNode;
    }

    public String getRelationType() {
        return relationType;
    }

    public void setRelationType(String relationType) {
        this.relationType = relationType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Boolean getConfirmed() {
        return confirmed;
    }

    public void setConfirmed(Boolean confirmed) {
        this.confirmed = confirmed;
    }

    public String getConfidence() {
        return confidence;
    }

    public void setConfidence(String confidence) {
        this.confidence = confidence;
    }
}
