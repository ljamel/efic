package com.detectivedex.entity;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests unitaires pour la classe EvidenceNode
 */
class EvidenceNodeTest {

    private EvidenceNode node;

    @BeforeEach
    void setUp() {
        node = new EvidenceNode();
    }

    @Test
    void testDefaultConstructor() {
        assertNotNull(node.getCreatedAt());
        assertNotNull(node.getUpdatedAt());
        assertEquals("#3498db", node.getColor());
        assertEquals(0.0, node.getPositionX());
        assertEquals(0.0, node.getPositionY());
    }

    @Test
    void testParameterizedConstructor() {
        EvidenceNode testNode = new EvidenceNode("SQL Injection", NodeType.VULNERABILITY, SeverityLevel.CRITICAL);
        
        assertEquals("SQL Injection", testNode.getName());
        assertEquals(NodeType.VULNERABILITY, testNode.getNodeType());
        assertEquals(SeverityLevel.CRITICAL, testNode.getSeverity());
        assertEquals("OPEN", testNode.getStatus());
        assertNotNull(testNode.getCreatedAt());
    }

    @Test
    void testSettersAndGetters() {
        node.setId(1L);
        node.setName("Test Node");
        node.setDescription("Test Description");
        node.setNodeType(NodeType.BUG);
        node.setSeverity(SeverityLevel.HIGH);
        node.setPositionX(100.0);
        node.setPositionY(200.0);
        node.setColor("#ff0000");
        node.setStatus("IN_PROGRESS");

        assertEquals(1L, node.getId());
        assertEquals("Test Node", node.getName());
        assertEquals("Test Description", node.getDescription());
        assertEquals(NodeType.BUG, node.getNodeType());
        assertEquals(SeverityLevel.HIGH, node.getSeverity());
        assertEquals(100.0, node.getPositionX());
        assertEquals(200.0, node.getPositionY());
        assertEquals("#ff0000", node.getColor());
        assertEquals("IN_PROGRESS", node.getStatus());
    }

    @Test
    void testTimestamps() {
        LocalDateTime before = LocalDateTime.now().minusSeconds(1);
        EvidenceNode newNode = new EvidenceNode();
        LocalDateTime after = LocalDateTime.now().plusSeconds(1);

        assertTrue(newNode.getCreatedAt().isAfter(before));
        assertTrue(newNode.getCreatedAt().isBefore(after));
        assertTrue(newNode.getUpdatedAt().isAfter(before));
        assertTrue(newNode.getUpdatedAt().isBefore(after));
    }

    @Test
    void testNodeTypeEnum() {
        node.setNodeType(NodeType.BUG);
        assertEquals(NodeType.BUG, node.getNodeType());
        
        node.setNodeType(NodeType.VULNERABILITY);
        assertEquals(NodeType.VULNERABILITY, node.getNodeType());
        
        node.setNodeType(NodeType.INCIDENT);
        assertEquals(NodeType.INCIDENT, node.getNodeType());
    }

    @Test
    void testSeverityEnum() {
        node.setSeverity(SeverityLevel.CRITICAL);
        assertEquals(SeverityLevel.CRITICAL, node.getSeverity());
        
        node.setSeverity(SeverityLevel.LOW);
        assertEquals(SeverityLevel.LOW, node.getSeverity());
    }

    @Test
    void testPositionDefaults() {
        assertEquals(0.0, node.getPositionX());
        assertEquals(0.0, node.getPositionY());
    }

    @Test
    void testColorDefault() {
        assertEquals("#3498db", node.getColor());
    }
}
