package com.detectivedex.rest;

import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import com.detectivedex.entity.EvidenceNode;
import com.detectivedex.entity.TimelineEvent;
import com.detectivedex.persistence.PersistenceManager;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Endpoint REST pour la gestion de la timeline
 */
@Path("/timeline")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TimelineResource {

    private EntityManager getEntityManager() {
        return PersistenceManager.getEntityManager();
    }

    /**
     * Récupère tous les événements de la timeline
     */
    @GET
    public Response getAllEvents() {
        EntityManager em = getEntityManager();
        try {
            TypedQuery<TimelineEvent> query = em.createQuery(
                "SELECT e FROM TimelineEvent e ORDER BY e.eventDate DESC",
                TimelineEvent.class
            );
            List<TimelineEvent> events = query.getResultList();
            return Response.ok(events).build();
        } finally {
            em.close();
        }
    }

    /**
     * Récupère un événement par son ID
     */
    @GET
    @Path("/{id}")
    public Response getEventById(@PathParam("id") Long id) {
        EntityManager em = getEntityManager();
        try {
            TimelineEvent event = em.find(TimelineEvent.class, id);
            if (event == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("{\"error\":\"Event not found\"}")
                        .build();
            }
            return Response.ok(event).build();
        } finally {
            em.close();
        }
    }

    /**
     * Crée un nouvel événement de timeline
     */
    @POST
    public Response createEvent(TimelineEvent event) {
        EntityManager em = getEntityManager();
        try {
            em.getTransaction().begin();
            EvidenceNode node = em.find(EvidenceNode.class, event.getEvidenceNode().getId());
            if (node == null) {
                em.getTransaction().rollback();
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity("{\"error\":\"Evidence node not found\"}")
                        .build();
            }

            event.setEvidenceNode(node);
            event.setCreatedAt(LocalDateTime.now());

            em.persist(event);
            em.getTransaction().commit();

            return Response.status(Response.Status.CREATED)
                    .entity(event)
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
     * Met à jour un événement
     */
    @PUT
    @Path("/{id}")
    public Response updateEvent(@PathParam("id") Long id, TimelineEvent updatedEvent) {
        EntityManager em = getEntityManager();
        try {
            em.getTransaction().begin();
            TimelineEvent event = em.find(TimelineEvent.class, id);
            if (event == null) {
                em.getTransaction().rollback();
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("{\"error\":\"Event not found\"}")
                        .build();
            }

            event.setTitle(updatedEvent.getTitle());
            event.setDescription(updatedEvent.getDescription());
            event.setEventDate(updatedEvent.getEventDate());
            event.setEventType(updatedEvent.getEventType());
            event.setEvidence(updatedEvent.getEvidence());

            em.merge(event);
            em.getTransaction().commit();
            return Response.ok(event).build();
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
     * Supprime un événement
     */
    @DELETE
    @Path("/{id}")
    public Response deleteEvent(@PathParam("id") Long id) {
        EntityManager em = getEntityManager();
        try {
            em.getTransaction().begin();
            TimelineEvent event = em.find(TimelineEvent.class, id);
            if (event == null) {
                em.getTransaction().rollback();
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("{\"error\":\"Event not found\"}")
                        .build();
            }

            em.remove(event);
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
     * Récupère les événements d'un nœud spécifique
     */
    @GET
    @Path("/node/{nodeId}")
    public Response getEventsForNode(@PathParam("nodeId") Long nodeId) {
        EntityManager em = getEntityManager();
        try {
            EvidenceNode node = em.find(EvidenceNode.class, nodeId);
            if (node == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("{\"error\":\"Node not found\"}")
                        .build();
            }

            TypedQuery<TimelineEvent> query = em.createQuery(
                "SELECT e FROM TimelineEvent e WHERE e.evidenceNode.id = :nodeId ORDER BY e.eventDate DESC",
                TimelineEvent.class
            );
            query.setParameter("nodeId", nodeId);
            List<TimelineEvent> events = query.getResultList();
            return Response.ok(events).build();
        } finally {
            em.close();
        }
    }

    /**
     * Récupère les événements par type
     */
    @GET
    @Path("/type/{type}")
    public Response getEventsByType(@PathParam("type") String type) {
        EntityManager em = getEntityManager();
        try {
            TypedQuery<TimelineEvent> query = em.createQuery(
                "SELECT e FROM TimelineEvent e WHERE e.eventType = :type ORDER BY e.eventDate DESC",
                TimelineEvent.class
            );
            query.setParameter("type", type);
            List<TimelineEvent> events = query.getResultList();
            return Response.ok(events).build();
        } finally {
            em.close();
        }
    }
}
