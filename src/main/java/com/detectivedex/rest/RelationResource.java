package com.detectivedex.rest;

import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import com.detectivedex.entity.EvidenceNode;
import com.detectivedex.entity.Relation;
import com.detectivedex.persistence.PersistenceManager;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Endpoint REST pour la gestion des relations entre nœuds
 */
@Path("/relations")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class RelationResource {

    private EntityManager getEntityManager() {
        return PersistenceManager.getEntityManager();
    }

    /**
     * Récupère toutes les relations
     */
    @GET
    public Response getAllRelations() {
        EntityManager em = getEntityManager();
        try {
            TypedQuery<Relation> query = em.createQuery(
                "SELECT r FROM Relation r ORDER BY r.createdAt DESC",
                Relation.class
            );
            List<Relation> relations = query.getResultList();
            return Response.ok(relations).build();
        } finally {
            em.close();
        }
    }

    /**
     * Récupère une relation par son ID
     */
    @GET
    @Path("/{id}")
    public Response getRelationById(@PathParam("id") Long id) {
        EntityManager em = getEntityManager();
        try {
            Relation relation = em.find(Relation.class, id);
            if (relation == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("{\"error\":\"Relation not found\"}")
                        .build();
            }
            return Response.ok(relation).build();
        } finally {
            em.close();
        }
    }

    /**
     * Crée une nouvelle relation
     */
    @POST
    public Response createRelation(Relation relation) {
        EntityManager em = getEntityManager();
        try {
            em.getTransaction().begin();
            EvidenceNode source = em.find(EvidenceNode.class, relation.getSourceNode().getId());
            EvidenceNode target = em.find(EvidenceNode.class, relation.getTargetNode().getId());

            if (source == null || target == null) {
                em.getTransaction().rollback();
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity("{\"error\":\"Source or target node not found\"}")
                        .build();
            }

            relation.setSourceNode(source);
            relation.setTargetNode(target);
            relation.setCreatedAt(LocalDateTime.now());

            em.persist(relation);
            em.getTransaction().commit();

            return Response.status(Response.Status.CREATED)
                    .entity(relation)
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
     * Met à jour une relation
     */
    @PUT
    @Path("/{id}")
    public Response updateRelation(@PathParam("id") Long id, Relation updatedRelation) {
        EntityManager em = getEntityManager();
        try {
            em.getTransaction().begin();
            Relation relation = em.find(Relation.class, id);
            if (relation == null) {
                em.getTransaction().rollback();
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("{\"error\":\"Relation not found\"}")
                        .build();
            }

            relation.setRelationType(updatedRelation.getRelationType());
            relation.setDescription(updatedRelation.getDescription());
            relation.setConfirmed(updatedRelation.getConfirmed());
            relation.setConfidence(updatedRelation.getConfidence());

            em.merge(relation);
            em.getTransaction().commit();
            return Response.ok(relation).build();
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
     * Supprime une relation
     */
    @DELETE
    @Path("/{id}")
    public Response deleteRelation(@PathParam("id") Long id) {
        EntityManager em = getEntityManager();
        try {
            em.getTransaction().begin();
            Relation relation = em.find(Relation.class, id);
            if (relation == null) {
                em.getTransaction().rollback();
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("{\"error\":\"Relation not found\"}")
                        .build();
            }

            em.remove(relation);
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
     * Récupère les relations d'un nœud source
     */
    @GET
    @Path("/from/{sourceId}")
    public Response getRelationsFromNode(@PathParam("sourceId") Long sourceId) {
        EntityManager em = getEntityManager();
        try {
            TypedQuery<Relation> query = em.createQuery(
                "SELECT r FROM Relation r WHERE r.sourceNode.id = :sourceId ORDER BY r.createdAt DESC",
                Relation.class
            );
            query.setParameter("sourceId", sourceId);
            List<Relation> relations = query.getResultList();
            return Response.ok(relations).build();
        } finally {
            em.close();
        }
    }

    /**
     * Récupère les relations vers un nœud cible
     */
    @GET
    @Path("/to/{targetId}")
    public Response getRelationsToNode(@PathParam("targetId") Long targetId) {
        EntityManager em = getEntityManager();
        try {
            TypedQuery<Relation> query = em.createQuery(
                "SELECT r FROM Relation r WHERE r.targetNode.id = :targetId ORDER BY r.createdAt DESC",
                Relation.class
            );
            query.setParameter("targetId", targetId);
            List<Relation> relations = query.getResultList();
            return Response.ok(relations).build();
        } finally {
            em.close();
        }
    }

    /**
     * Récupère les relations par type
     */
    @GET
    @Path("/type/{type}")
    public Response getRelationsByType(@PathParam("type") String type) {
        EntityManager em = getEntityManager();
        try {
            TypedQuery<Relation> query = em.createQuery(
                "SELECT r FROM Relation r WHERE r.relationType = :type ORDER BY r.createdAt DESC",
                Relation.class
            );
            query.setParameter("type", type);
            List<Relation> relations = query.getResultList();
            return Response.ok(relations).build();
        } finally {
            em.close();
        }
    }
}
