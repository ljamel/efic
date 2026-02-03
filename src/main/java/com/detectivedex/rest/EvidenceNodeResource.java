package com.detectivedex.rest;

import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import com.detectivedex.entity.EvidenceNode;
import com.detectivedex.entity.NodeType;
import com.detectivedex.entity.SeverityLevel;
import com.detectivedex.persistence.PersistenceManager;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Endpoint REST pour la gestion des nœuds de preuve
 */
@Path("/nodes")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class EvidenceNodeResource {

    private EntityManager getEntityManager() {
        return PersistenceManager.getEntityManager();
    }

    /**
     * Récupère tous les nœuds
     */
    @GET
    public Response getAllNodes() {
        EntityManager em = getEntityManager();
        try {
            TypedQuery<EvidenceNode> query = em.createQuery(
                "SELECT n FROM EvidenceNode n ORDER BY n.createdAt DESC",
                EvidenceNode.class
            );
            List<EvidenceNode> nodes = query.getResultList();
            return Response.ok(nodes).build();
        } finally {
            em.close();
        }
    }

    /**
     * Récupère un nœud par son ID
     */
    @GET
    @Path("/{id}")
    public Response getNodeById(@PathParam("id") Long id) {
        EntityManager em = getEntityManager();
        try {
            EvidenceNode node = em.find(EvidenceNode.class, id);
            if (node == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("{\"error\":\"Node not found\"}")
                        .build();
            }
            return Response.ok(node).build();
        } finally {
            em.close();
        }
    }

    /**
     * Crée un nouveau nœud
     */
    @POST
    public Response createNode(EvidenceNode node) {
        EntityManager em = getEntityManager();
        try {
            em.getTransaction().begin();
            node.setCreatedAt(LocalDateTime.now());
            node.setUpdatedAt(LocalDateTime.now());
            if (node.getStatus() == null) {
                node.setStatus("OPEN");
            }
            em.persist(node);
            em.getTransaction().commit();
            return Response.status(Response.Status.CREATED)
                    .entity(node)
                    .build();
        } catch (Exception e) {
            if (em.getTransaction().isActive()) {
                em.getTransaction().rollback();
            }
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\":\"" + e.getMessage() + "\"}")
                    .build();
        } finally {
            em.close();
        }
    }

    /**
     * Met à jour un nœud existant
     */
    @PUT
    @Path("/{id}")
    public Response updateNode(@PathParam("id") Long id, EvidenceNode updatedNode) {
        EntityManager em = getEntityManager();
        try {
            em.getTransaction().begin();
            EvidenceNode node = em.find(EvidenceNode.class, id);
            if (node == null) {
                em.getTransaction().rollback();
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("{\"error\":\"Node not found\"}")
                        .build();
            }

            if (updatedNode.getName() != null) {
                node.setName(updatedNode.getName());
            }
            if (updatedNode.getDescription() != null) {
                node.setDescription(updatedNode.getDescription());
            }
            if (updatedNode.getNodeType() != null) {
                node.setNodeType(updatedNode.getNodeType());
            }
            if (updatedNode.getSeverity() != null) {
                node.setSeverity(updatedNode.getSeverity());
            }
            if (updatedNode.getPositionX() != null) {
                node.setPositionX(updatedNode.getPositionX());
            }
            if (updatedNode.getPositionY() != null) {
                node.setPositionY(updatedNode.getPositionY());
            }
            if (updatedNode.getColor() != null) {
                node.setColor(updatedNode.getColor());
            }
            if (updatedNode.getStatus() != null) {
                node.setStatus(updatedNode.getStatus());
            }
            node.setUpdatedAt(LocalDateTime.now());

            em.merge(node);
            em.getTransaction().commit();
            return Response.ok(node).build();
        } catch (Exception e) {
            if (em.getTransaction().isActive()) {
                em.getTransaction().rollback();
            }
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\":\"" + e.getMessage() + "\"}")
                    .build();
        } finally {
            em.close();
        }
    }

    /**
     * Supprime un nœud
     */
    @DELETE
    @Path("/{id}")
    public Response deleteNode(@PathParam("id") Long id) {
        EntityManager em = getEntityManager();
        try {
            em.getTransaction().begin();
            EvidenceNode node = em.find(EvidenceNode.class, id);
            if (node == null) {
                em.getTransaction().rollback();
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("{\"error\":\"Node not found\"}")
                        .build();
            }

            em.remove(node);
            em.getTransaction().commit();
            return Response.noContent().build();
        } catch (Exception e) {
            if (em.getTransaction().isActive()) {
                em.getTransaction().rollback();
            }
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\":\"" + e.getMessage() + "\"}")
                    .build();
        } finally {
            em.close();
        }
    }

    /**
     * Récupère les nœuds par type
     */
    @GET
    @Path("/type/{type}")
    public Response getNodesByType(@PathParam("type") String type) {
        EntityManager em = getEntityManager();
        try {
            NodeType nodeType = NodeType.valueOf(type.toUpperCase());
            TypedQuery<EvidenceNode> query = em.createQuery(
                "SELECT n FROM EvidenceNode n WHERE n.nodeType = :type ORDER BY n.createdAt DESC",
                EvidenceNode.class
            );
            query.setParameter("type", nodeType);
            List<EvidenceNode> nodes = query.getResultList();
            return Response.ok(nodes).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\":\"Invalid node type\"}")
                    .build();
        } finally {
            em.close();
        }
    }

    /**
     * Récupère les nœuds par sévérité
     */
    @GET
    @Path("/severity/{severity}")
    public Response getNodesBySeverity(@PathParam("severity") String severity) {
        EntityManager em = getEntityManager();
        try {
            SeverityLevel severityLevel = SeverityLevel.valueOf(severity.toUpperCase());
            TypedQuery<EvidenceNode> query = em.createQuery(
                "SELECT n FROM EvidenceNode n WHERE n.severity = :severity ORDER BY n.createdAt DESC",
                EvidenceNode.class
            );
            query.setParameter("severity", severityLevel);
            List<EvidenceNode> nodes = query.getResultList();
            return Response.ok(nodes).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\":\"Invalid severity level\"}")
                    .build();
        } finally {
            em.close();
        }
    }

    /**
     * Récupère les nœuds par statut
     */
    @GET
    @Path("/status/{status}")
    public Response getNodesByStatus(@PathParam("status") String status) {
        EntityManager em = getEntityManager();
        try {
            TypedQuery<EvidenceNode> query = em.createQuery(
                "SELECT n FROM EvidenceNode n WHERE n.status = :status ORDER BY n.createdAt DESC",
                EvidenceNode.class
            );
            query.setParameter("status", status);
            List<EvidenceNode> nodes = query.getResultList();
            return Response.ok(nodes).build();
        } finally {
            em.close();
        }
    }
}
