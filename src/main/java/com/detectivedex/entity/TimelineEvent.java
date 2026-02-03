package com.detectivedex.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Entité représentant un événement dans la timeline d'un nœud
 */
@Entity
@Table(name = "timeline_events")
public class TimelineEvent implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.REFRESH)
    @JoinColumn(name = "evidence_node_id", nullable = false)
    private EvidenceNode evidenceNode;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private LocalDateTime eventDate;

    @Column(length = 50)
    private String eventType; // DISCOVERED, CONFIRMED, EXPLOITED, MITIGATED, ESCALATED, etc.

    @Column(columnDefinition = "TEXT")
    private String evidence;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    // Constructeurs
    public TimelineEvent() {
        this.createdAt = LocalDateTime.now();
    }

    public TimelineEvent(EvidenceNode evidenceNode, String title, LocalDateTime eventDate, String eventType) {
        this();
        this.evidenceNode = evidenceNode;
        this.title = title;
        this.eventDate = eventDate;
        this.eventType = eventType;
    }

    // Getters et Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public EvidenceNode getEvidenceNode() {
        return evidenceNode;
    }

    public void setEvidenceNode(EvidenceNode evidenceNode) {
        this.evidenceNode = evidenceNode;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getEventDate() {
        return eventDate;
    }

    public void setEventDate(LocalDateTime eventDate) {
        this.eventDate = eventDate;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public String getEvidence() {
        return evidence;
    }

    public void setEvidence(String evidence) {
        this.evidence = evidence;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
