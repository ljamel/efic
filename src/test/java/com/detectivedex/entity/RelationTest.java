package com.detectivedex.entity;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests unitaires pour la classe Relation
 */
class RelationTest {

    private Relation relation;
    private EvidenceNode sourceNode;
    private EvidenceNode targetNode;

    @BeforeEach
    void setUp() {
        sourceNode = new EvidenceNode("Source", NodeType.BUG, SeverityLevel.HIGH);
        sourceNode.setId(1L);
        
        targetNode = new EvidenceNode("Target", NodeType.VULNERABILITY, SeverityLevel.CRITICAL);
        targetNode.setId(2L);
        
        relation = new Relation();
    }

    @Test
    void testDefaultConstructor() {
        assertNotNull(relation.getCreatedAt());
        assertFalse(relation.getConfirmed());
    }

    @Test
    void testParameterizedConstructor() {
        Relation testRelation = new Relation(sourceNode, targetNode, "CAUSES");
        
        assertEquals(sourceNode, testRelation.getSourceNode());
        assertEquals(targetNode, testRelation.getTargetNode());
        assertEquals("CAUSES", testRelation.getRelationType());
        assertNotNull(testRelation.getCreatedAt());
    }

    @Test
    void testSettersAndGetters() {
        relation.setId(1L);
        relation.setSourceNode(sourceNode);
        relation.setTargetNode(targetNode);
        relation.setRelationType("RELATED_TO");
        relation.setDescription("Test relation");
        relation.setConfirmed(true);
        relation.setConfidence("HIGH");

        assertEquals(1L, relation.getId());
        assertEquals(sourceNode, relation.getSourceNode());
        assertEquals(targetNode, relation.getTargetNode());
        assertEquals("RELATED_TO", relation.getRelationType());
        assertEquals("Test relation", relation.getDescription());
        assertTrue(relation.getConfirmed());
        assertEquals("HIGH", relation.getConfidence());
    }

    @Test
    void testTimestamp() {
        LocalDateTime before = LocalDateTime.now().minusSeconds(1);
        Relation newRelation = new Relation();
        LocalDateTime after = LocalDateTime.now().plusSeconds(1);

        assertTrue(newRelation.getCreatedAt().isAfter(before));
        assertTrue(newRelation.getCreatedAt().isBefore(after));
    }

    @Test
    void testConfirmedDefault() {
        assertFalse(relation.getConfirmed());
    }

    @Test
    void testRelationTypes() {
        relation.setRelationType("CAUSES");
        assertEquals("CAUSES", relation.getRelationType());
        
        relation.setRelationType("EXPLOITS");
        assertEquals("EXPLOITS", relation.getRelationType());
        
        relation.setRelationType("MITIGATES");
        assertEquals("MITIGATES", relation.getRelationType());
    }

    @Test
    void testConfidenceLevels() {
        relation.setConfidence("HIGH");
        assertEquals("HIGH", relation.getConfidence());
        
        relation.setConfidence("MEDIUM");
        assertEquals("MEDIUM", relation.getConfidence());
        
        relation.setConfidence("LOW");
        assertEquals("LOW", relation.getConfidence());
    }
}
