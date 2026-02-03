package com.detectivedex.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Entité représentant un nœud du graphe (preuve, incident, artefact)
 */
@Entity
@Table(name = "evidence_nodes")
public class EvidenceNode implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NodeType nodeType; // BUG, VULNERABILITY, INCIDENT, ARTIFACT, ENDPOINT, ATTACKER, etc.

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SeverityLevel severity; // CRITICAL, HIGH, MEDIUM, LOW, INFO

    @Column(nullable = false, columnDefinition = "DOUBLE DEFAULT 0.0")
    private Double positionX = 0.0;

    @Column(nullable = false, columnDefinition = "DOUBLE DEFAULT 0.0")
    private Double positionY = 0.0;

    @Column(nullable = false)
    private String color = "#3498db";

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Column(length = 50)
    private String status; // OPEN, RESOLVED, IN_PROGRESS, CLOSED

    // Relations OneToMany
    @JsonIgnore
    @OneToMany(mappedBy = "sourceNode", cascade = CascadeType.REMOVE, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<Relation> outgoingRelations = new HashSet<>();

    @JsonIgnore
    @OneToMany(mappedBy = "targetNode", cascade = CascadeType.REMOVE, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<Relation> incomingRelations = new HashSet<>();

    @JsonIgnore
    @OneToMany(mappedBy = "evidenceNode", cascade = CascadeType.REMOVE, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<TimelineEvent> events = new HashSet<>();

    // Constructeurs
    public EvidenceNode() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public EvidenceNode(String name, NodeType nodeType, SeverityLevel severity) {
        this();
        this.name = name;
        this.nodeType = nodeType;
        this.severity = severity;
        this.status = "OPEN";
    }

    // Getters et Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public NodeType getNodeType() {
        return nodeType;
    }

    public void setNodeType(NodeType nodeType) {
        this.nodeType = nodeType;
    }

    public SeverityLevel getSeverity() {
        return severity;
    }

    public void setSeverity(SeverityLevel severity) {
        this.severity = severity;
    }

    public Double getPositionX() {
        return positionX;
    }

    public void setPositionX(Double positionX) {
        this.positionX = positionX;
    }

    public Double getPositionY() {
        return positionY;
    }

    public void setPositionY(Double positionY) {
        this.positionY = positionY;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Set<Relation> getOutgoingRelations() {
        return outgoingRelations;
    }

    public void setOutgoingRelations(Set<Relation> outgoingRelations) {
        this.outgoingRelations = outgoingRelations;
    }

    public Set<Relation> getIncomingRelations() {
        return incomingRelations;
    }

    public void setIncomingRelations(Set<Relation> incomingRelations) {
        this.incomingRelations = incomingRelations;
    }

    public Set<TimelineEvent> getEvents() {
        return events;
    }

    public void setEvents(Set<TimelineEvent> events) {
        this.events = events;
    }
}
