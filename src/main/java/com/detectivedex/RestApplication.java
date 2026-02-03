package com.detectivedex;

import jakarta.ws.rs.ApplicationPath;
import jakarta.ws.rs.core.Application;

/**
 * Classe d'application REST pour déterminer le chemin de base des endpoints
 */
@ApplicationPath("/api")
public class RestApplication extends Application {
    // Les endpoints seront disponibles sous /api
}
