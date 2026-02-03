package com.detectivedex.persistence;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.Persistence;

/**
 * Gestionnaire singleton pour la EntityManagerFactory
 * Assure que toutes les classes utilisent la même instance EMF
 */
public class PersistenceManager {
    private static EntityManagerFactory emf;

    static {
        emf = Persistence.createEntityManagerFactory("DetectiveDexPU");
    }

    private PersistenceManager() {
    }

    public static EntityManagerFactory getEntityManagerFactory() {
        return emf;
    }

    public static EntityManager getEntityManager() {
        return emf.createEntityManager();
    }

    public static void closeEntityManagerFactory() {
        if (emf != null && emf.isOpen()) {
            emf.close();
        }
    }
}
