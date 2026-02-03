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
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Endpoint REST pour l'export de rapports
 */
@Path("/reports")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ReportResource {

    private EntityManager getEntityManager() {
        return PersistenceManager.getEntityManager();
    }

    /**
     * Exporte un rapport complet en JSON
     */
    @GET
    @Path("/export/json")
    @Produces(MediaType.APPLICATION_JSON)
    public Response exportJsonReport() {
        EntityManager em = getEntityManager();
        try {
            TypedQuery<EvidenceNode> nodesQuery = em.createQuery(
                "SELECT n FROM EvidenceNode n ORDER BY n.createdAt DESC",
                EvidenceNode.class
            );
            List<EvidenceNode> nodes = nodesQuery.getResultList();

            TypedQuery<Relation> relationsQuery = em.createQuery(
                "SELECT r FROM Relation r ORDER BY r.createdAt DESC",
                Relation.class
            );
            List<Relation> relations = relationsQuery.getResultList();

            StringBuilder json = new StringBuilder();
            json.append("{\n");
            json.append("  \"exportDate\": \"").append(LocalDateTime.now()).append("\",\n");
            json.append("  \"nodeCount\": ").append(nodes.size()).append(",\n");
            json.append("  \"relationCount\": ").append(relations.size()).append(",\n");
            json.append("  \"nodes\": [\n");

            for (int i = 0; i < nodes.size(); i++) {
                EvidenceNode node = nodes.get(i);
                json.append("    {\n");
                json.append("      \"id\": ").append(node.getId()).append(",\n");
                json.append("      \"name\": \"").append(escapeJson(node.getName())).append("\",\n");
                json.append("      \"nodeType\": \"").append(node.getNodeType()).append("\",\n");
                json.append("      \"severity\": \"").append(node.getSeverity()).append("\",\n");
                json.append("      \"status\": \"").append(node.getStatus()).append("\",\n");
                json.append("      \"createdAt\": \"").append(node.getCreatedAt()).append("\"\n");
                json.append("    }");
                if (i < nodes.size() - 1) json.append(",");
                json.append("\n");
            }

            json.append("  ],\n");
            json.append("  \"relations\": [\n");

            for (int i = 0; i < relations.size(); i++) {
                Relation relation = relations.get(i);
                json.append("    {\n");
                json.append("      \"id\": ").append(relation.getId()).append(",\n");
                json.append("      \"sourceNodeId\": ").append(relation.getSourceNode().getId()).append(",\n");
                json.append("      \"targetNodeId\": ").append(relation.getTargetNode().getId()).append(",\n");
                json.append("      \"relationType\": \"").append(relation.getRelationType()).append("\",\n");
                json.append("      \"confirmed\": ").append(relation.getConfirmed()).append("\n");
                json.append("    }");
                if (i < relations.size() - 1) json.append(",");
                json.append("\n");
            }

            json.append("  ]\n");
            json.append("}");

            return Response.ok(json.toString())
                    .header("Content-Disposition", "attachment; filename=detectivedex-export.json")
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\":\"" + e.getMessage() + "\"}")
                    .build();
        } finally {
            em.close();
        }
    }

    /**
     * Exporte un rapport en HTML
     */
    @GET
    @Path("/export/html")
    @Produces(MediaType.TEXT_HTML)
    public Response exportHtmlReport() {
        EntityManager em = getEntityManager();
        try {
            TypedQuery<EvidenceNode> nodesQuery = em.createQuery(
                "SELECT n FROM EvidenceNode n ORDER BY n.severity DESC, n.createdAt DESC",
                EvidenceNode.class
            );
            List<EvidenceNode> nodes = nodesQuery.getResultList();

            StringBuilder html = new StringBuilder();
            html.append("<!DOCTYPE html>\n");
            html.append("<html lang=\"fr\">\n");
            html.append("<head>\n");
            html.append("  <meta charset=\"UTF-8\">\n");
            html.append("  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n");
            html.append("  <title>Rapport DetectiveDex</title>\n");
            html.append("  <style>\n");
            html.append("    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }\n");
            html.append("    .header { background: #2c3e50; color: white; padding: 20px; border-radius: 5px; }\n");
            html.append("    .summary { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; }\n");
            html.append("    .node-section { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; }\n");
            html.append("    .node-item { border-left: 4px solid #3498db; padding: 15px; margin: 10px 0; background: #ecf0f1; }\n");
            html.append("    .critical { border-left-color: #e74c3c; }\n");
            html.append("    .high { border-left-color: #e67e22; }\n");
            html.append("    .medium { border-left-color: #f39c12; }\n");
            html.append("    .low { border-left-color: #3498db; }\n");
            html.append("    .badge { display: inline-block; padding: 5px 10px; margin: 5px 5px 5px 0; border-radius: 3px; font-size: 12px; font-weight: bold; }\n");
            html.append("    .badge-critical { background: #e74c3c; color: white; }\n");
            html.append("    .badge-high { background: #e67e22; color: white; }\n");
            html.append("    .badge-medium { background: #f39c12; color: white; }\n");
            html.append("    .badge-low { background: #3498db; color: white; }\n");
            html.append("    .badge-info { background: #95a5a6; color: white; }\n");
            html.append("  </style>\n");
            html.append("</head>\n");
            html.append("<body>\n");
            html.append("  <div class=\"header\">\n");
            html.append("    <h1>Rapport DetectiveDex</h1>\n");
            html.append("    <p>Généré le ").append(LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"))).append("</p>\n");
            html.append("  </div>\n");

            html.append("  <div class=\"summary\">\n");
            html.append("    <h2>Résumé</h2>\n");
            html.append("    <p><strong>Nombre total de nœuds :</strong> ").append(nodes.size()).append("</p>\n");

            long critical = nodes.stream().filter(n -> n.getSeverity().toString().equals("CRITICAL")).count();
            long high = nodes.stream().filter(n -> n.getSeverity().toString().equals("HIGH")).count();
            long medium = nodes.stream().filter(n -> n.getSeverity().toString().equals("MEDIUM")).count();
            long low = nodes.stream().filter(n -> n.getSeverity().toString().equals("LOW")).count();

            html.append("    <p><span class=\"badge badge-critical\">CRITIQUE: ").append(critical).append("</span>");
            html.append("       <span class=\"badge badge-high\">HAUT: ").append(high).append("</span>");
            html.append("       <span class=\"badge badge-medium\">MOYEN: ").append(medium).append("</span>");
            html.append("       <span class=\"badge badge-low\">BAS: ").append(low).append("</span></p>\n");
            html.append("  </div>\n");

            html.append("  <div class=\"node-section\">\n");
            html.append("    <h2>Détails des Nœuds</h2>\n");

            for (EvidenceNode node : nodes) {
                String severityClass = node.getSeverity().toString().toLowerCase();
                html.append("    <div class=\"node-item ").append(severityClass).append("\">\n");
                html.append("      <h3>").append(escapeHtml(node.getName())).append("</h3>\n");
                html.append("      <p><span class=\"badge badge-").append(severityClass).append("\">").append(node.getSeverity().getLabel()).append("</span>");
                html.append(" <span class=\"badge badge-info\">").append(node.getNodeType().getLabel()).append("</span></p>\n");
                if (node.getDescription() != null) {
                    html.append("      <p>").append(escapeHtml(node.getDescription())).append("</p>\n");
                }
                html.append("      <p><small>Créé le ").append(node.getCreatedAt()).append(" | Statut: ").append(node.getStatus()).append("</small></p>\n");
                html.append("    </div>\n");
            }

            html.append("  </div>\n");
            html.append("</body>\n");
            html.append("</html>");

            return Response.ok(html.toString())
                    .header("Content-Disposition", "attachment; filename=detectivedex-report.html")
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\":\"" + e.getMessage() + "\"}")
                    .build();
        } finally {
            em.close();
        }
    }

    /**
     * Récupère les statistiques globales
     */
    @GET
    @Path("/statistics")
    public Response getStatistics() {
        EntityManager em = getEntityManager();
        try {
            TypedQuery<EvidenceNode> nodesQuery = em.createQuery(
                "SELECT n FROM EvidenceNode n",
                EvidenceNode.class
            );
            List<EvidenceNode> nodes = nodesQuery.getResultList();

            TypedQuery<Relation> relationsQuery = em.createQuery(
                "SELECT r FROM Relation r",
                Relation.class
            );
            List<Relation> relations = relationsQuery.getResultList();

            StringBuilder stats = new StringBuilder();
            stats.append("{\n");
            stats.append("  \"totalNodes\": ").append(nodes.size()).append(",\n");
            stats.append("  \"totalRelations\": ").append(relations.size()).append(",\n");
            stats.append("  \"nodesBySeverity\": {\n");
            stats.append("    \"CRITICAL\": ").append(nodes.stream().filter(n -> n.getSeverity().toString().equals("CRITICAL")).count()).append(",\n");
            stats.append("    \"HIGH\": ").append(nodes.stream().filter(n -> n.getSeverity().toString().equals("HIGH")).count()).append(",\n");
            stats.append("    \"MEDIUM\": ").append(nodes.stream().filter(n -> n.getSeverity().toString().equals("MEDIUM")).count()).append(",\n");
            stats.append("    \"LOW\": ").append(nodes.stream().filter(n -> n.getSeverity().toString().equals("LOW")).count()).append(",\n");
            stats.append("    \"INFO\": ").append(nodes.stream().filter(n -> n.getSeverity().toString().equals("INFO")).count()).append("\n");
            stats.append("  },\n");
            stats.append("  \"nodesByStatus\": {\n");
            long open = nodes.stream().filter(n -> "OPEN".equals(n.getStatus())).count();
            long resolved = nodes.stream().filter(n -> "RESOLVED".equals(n.getStatus())).count();
            long inProgress = nodes.stream().filter(n -> "IN_PROGRESS".equals(n.getStatus())).count();
            stats.append("    \"OPEN\": ").append(open).append(",\n");
            stats.append("    \"IN_PROGRESS\": ").append(inProgress).append(",\n");
            stats.append("    \"RESOLVED\": ").append(resolved).append("\n");
            stats.append("  }\n");
            stats.append("}");

            return Response.ok(stats.toString()).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\":\"" + e.getMessage() + "\"}")
                    .build();
        } finally {
            em.close();
        }
    }

    private String escapeJson(String str) {
        if (str == null) return "";
        return str.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }

    private String escapeHtml(String str) {
        if (str == null) return "";
        return str.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
