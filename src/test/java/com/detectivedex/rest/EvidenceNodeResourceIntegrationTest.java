package com.detectivedex.rest;

import com.detectivedex.entity.EvidenceNode;
import com.detectivedex.entity.NodeType;
import com.detectivedex.entity.SeverityLevel;
import jakarta.ws.rs.core.Response;
import org.junit.jupiter.api.*;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests d'intégration pour EvidenceNodeResource
 */
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class EvidenceNodeResourceIntegrationTest {

    private static EvidenceNodeResource resource;
    private static Long createdNodeId;

    @BeforeAll
    static void setUp() {
        resource = new EvidenceNodeResource();
    }

    @Test
    @Order(1)
    void testGetAllNodes_Empty() {
        Response response = resource.getAllNodes();
        assertEquals(Response.Status.OK.getStatusCode(), response.getStatus());
    }

    @Test
    @Order(2)
    void testCreateNode_Success() {
        EvidenceNode node = new EvidenceNode();
        node.setName("Test Bug");
        node.setNodeType(NodeType.BUG);
        node.setSeverity(SeverityLevel.HIGH);
        node.setStatus("OPEN");
        node.setDescription("Test description");

        Response response = resource.createNode(node);
        assertEquals(Response.Status.CREATED.getStatusCode(), response.getStatus());
        
        EvidenceNode created = (EvidenceNode) response.getEntity();
        assertNotNull(created.getId());
        assertEquals("Test Bug", created.getName());
        assertEquals(NodeType.BUG, created.getNodeType());
        
        createdNodeId = created.getId();
    }

    @Test
    @Order(3)
    void testGetNodeById_Success() {
        Response response = resource.getNodeById(createdNodeId);
        assertEquals(Response.Status.OK.getStatusCode(), response.getStatus());
        
        EvidenceNode node = (EvidenceNode) response.getEntity();
        assertEquals(createdNodeId, node.getId());
        assertEquals("Test Bug", node.getName());
    }

    @Test
    @Order(4)
    void testGetNodeById_NotFound() {
        Response response = resource.getNodeById(99999L);
        assertEquals(Response.Status.NOT_FOUND.getStatusCode(), response.getStatus());
    }

    @Test
    @Order(5)
    void testUpdateNode_Success() {
        EvidenceNode updates = new EvidenceNode();
        updates.setName("Updated Bug");
        updates.setStatus("RESOLVED");
        updates.setSeverity(SeverityLevel.CRITICAL);

        Response response = resource.updateNode(createdNodeId, updates);
        assertEquals(Response.Status.OK.getStatusCode(), response.getStatus());
        
        EvidenceNode updated = (EvidenceNode) response.getEntity();
        assertEquals("Updated Bug", updated.getName());
        assertEquals("RESOLVED", updated.getStatus());
    }

    @Test
    @Order(6)
    void testDeleteNode_Success() {
        Response response = resource.deleteNode(createdNodeId);
        assertEquals(Response.Status.NO_CONTENT.getStatusCode(), response.getStatus());
        
        // Vérifier que le nœud est supprimé
        Response getResponse = resource.getNodeById(createdNodeId);
        assertEquals(Response.Status.NOT_FOUND.getStatusCode(), getResponse.getStatus());
    }
}
