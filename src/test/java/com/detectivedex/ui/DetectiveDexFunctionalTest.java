package com.detectivedex.ui;

import com.microsoft.playwright.Browser;
import com.microsoft.playwright.BrowserType;
import com.microsoft.playwright.Download;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.Playwright;
import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Locale;

import static org.junit.jupiter.api.Assertions.assertTrue;

@Disabled("Tests Playwright - exécution manuelle uniquement")
class DetectiveDexFunctionalTest {
    private static HttpServer server;
    private static String baseUrl;
    private static Playwright playwright;
    private static Browser browser;

    private Page page;

    @BeforeAll
    static void startServerAndBrowser() throws IOException {
        Path webRoot = Paths.get("src/main/webapp").toAbsolutePath();

        server = HttpServer.create(new InetSocketAddress(0), 0);
        server.createContext("/", exchange -> handleStaticRequest(exchange, webRoot));
        server.start();

        int port = server.getAddress().getPort();
        baseUrl = "http://localhost:" + port + "/";

        playwright = Playwright.create();
        browser = playwright.chromium().launch(new BrowserType.LaunchOptions().setHeadless(true));
    }

    @AfterAll
    static void stopServerAndBrowser() {
        if (browser != null) browser.close();
        if (playwright != null) playwright.close();
        if (server != null) server.stop(0);
    }

    @BeforeEach
    void openPage() {
        page = browser.newPage();
        page.navigate(baseUrl);
        page.waitForSelector("#cy");
        page.evaluate("() => localStorage.clear()");
        page.reload();
        page.waitForSelector("#cy");
    }

    @Test
    void ajoutDeNoeud() {
        createNode("Node Test");
        page.waitForFunction("() => JSON.parse(localStorage.getItem('detectivedex_nodes') || '[]').length === 1");
        Object result = page.evaluate("() => JSON.parse(localStorage.getItem('detectivedex_nodes') || '[]')[0]?.name === 'Node Test'");
        assertTrue((Boolean) result);
    }

    @Test
    void ajouterDesRelations() {
        createNode("Source Node");
        createNode("Target Node");

        page.click("#btnAddRelation");
        page.waitForSelector("#modalAddRelation.active");
        page.selectOption("#relationSource", "1");
        page.selectOption("#relationTarget", "2");
        page.selectOption("#relationType", "CAUSES");
        page.click("#formAddRelation button[type='submit']");

        page.waitForFunction("() => JSON.parse(localStorage.getItem('detectivedex_relations') || '[]').length === 1");
        Object result = page.evaluate("() => JSON.parse(localStorage.getItem('detectivedex_relations') || '[]')[0]?.relationType === 'CAUSES'");
        assertTrue((Boolean) result);
    }

    @Test
    void glisserDeposerTexte() {
        page.evaluate("""
            () => {
              const dt = new DataTransfer();
              dt.setData('text/plain', 'Node Drag\nDescription test');
              const target = document.getElementById('cy');
              const rect = target.getBoundingClientRect();
              const x = rect.left + 60;
              const y = rect.top + 60;
              target.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer: dt, clientX: x, clientY: y }));
              target.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt, clientX: x, clientY: y }));
            }
        """);

        page.waitForFunction("() => JSON.parse(localStorage.getItem('detectivedex_nodes') || '[]').length === 1");
        Object result = page.evaluate("() => JSON.parse(localStorage.getItem('detectivedex_nodes') || '[]')[0]?.name === 'Node Drag'");
        assertTrue((Boolean) result);
    }

    @Test
    void exportJson() throws IOException {
        createNode("Export Node");

        Download download = page.waitForDownload(() -> page.click("#btnExportJSON"));
        Path path = download.path();
        String json = Files.readString(path);

        assertTrue(json.contains("\"nodes\""));
        assertTrue(json.contains("Export Node"));
    }

    private void createNode(String name) {
        page.click("#btnAddNode");
        page.waitForSelector("#modalAddNode.active");
        page.fill("#nodeeName", name);
        page.click("#formAddNode button[type='submit']");
        page.waitForFunction("() => JSON.parse(localStorage.getItem('detectivedex_nodes') || '[]').length >= 1");
    }

    private static void handleStaticRequest(HttpExchange exchange, Path webRoot) throws IOException {
        String requestPath = exchange.getRequestURI().getPath();
        if (requestPath.equals("/")) {
            requestPath = "/index.html";
        }

        Path filePath = webRoot.resolve(requestPath.substring(1)).normalize();
        if (!filePath.startsWith(webRoot) || !Files.exists(filePath) || Files.isDirectory(filePath)) {
            exchange.sendResponseHeaders(404, 0);
            exchange.close();
            return;
        }

        byte[] bytes = Files.readAllBytes(filePath);
        Headers headers = exchange.getResponseHeaders();
        headers.add("Content-Type", guessContentType(filePath));
        exchange.sendResponseHeaders(200, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private static String guessContentType(Path filePath) throws IOException {
        String contentType = Files.probeContentType(filePath);
        if (contentType != null) return contentType;

        String name = filePath.getFileName().toString().toLowerCase(Locale.ROOT);
        if (name.endsWith(".html")) return "text/html";
        if (name.endsWith(".css")) return "text/css";
        if (name.endsWith(".js")) return "application/javascript";
        if (name.endsWith(".json")) return "application/json";
        if (name.endsWith(".svg")) return "image/svg+xml";
        if (name.endsWith(".png")) return "image/png";
        if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
        return "application/octet-stream";
    }
}
