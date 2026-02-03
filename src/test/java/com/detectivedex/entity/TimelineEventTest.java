package com.detectivedex.entity;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests unitaires pour la classe TimelineEvent
 */
class TimelineEventTest {

    private TimelineEvent event;
    private EvidenceNode node;

    @BeforeEach
    void setUp() {
        node = new EvidenceNode("Test Node", NodeType.BUG, SeverityLevel.HIGH);
        node.setId(1L);
        event = new TimelineEvent();
    }

    @Test
    void testDefaultConstructor() {
        assertNotNull(event.getCreatedAt());
    }

    @Test
    void testSettersAndGetters() {
        LocalDateTime eventDate = LocalDateTime.now();
        
        event.setId(1L);
        event.setEvidenceNode(node);
        event.setTitle("Test Event");
        event.setDescription("Test description");
        event.setEventDate(eventDate);
        event.setEventType("CREATED");
        event.setEvidence("Evidence data");

        assertEquals(1L, event.getId());
        assertEquals(node, event.getEvidenceNode());
        assertEquals("Test Event", event.getTitle());
        assertEquals("Test description", event.getDescription());
        assertEquals(eventDate, event.getEventDate());
        assertEquals("CREATED", event.getEventType());
        assertEquals("Evidence data", event.getEvidence());
    }

    @Test
    void testTimestamp() {
        LocalDateTime before = LocalDateTime.now().minusSeconds(1);
        TimelineEvent newEvent = new TimelineEvent();
        LocalDateTime after = LocalDateTime.now().plusSeconds(1);

        assertTrue(newEvent.getCreatedAt().isAfter(before));
        assertTrue(newEvent.getCreatedAt().isBefore(after));
    }

    @Test
    void testEventTypes() {
        event.setEventType("CREATED");
        assertEquals("CREATED", event.getEventType());
        
        event.setEventType("UPDATED");
        assertEquals("UPDATED", event.getEventType());
        
        event.setEventType("RESOLVED");
        assertEquals("RESOLVED", event.getEventType());
    }
}
