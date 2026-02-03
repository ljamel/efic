package com.detectivedex.persistence;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests unitaires pour PersistenceManager
 */
class PersistenceManagerTest {

    @Test
    void testGetEntityManagerFactory() {
        EntityManagerFactory emf = PersistenceManager.getEntityManagerFactory();
        assertNotNull(emf);
        assertTrue(emf.isOpen());
    }

    @Test
    void testGetEntityManager() {
        EntityManager em = PersistenceManager.getEntityManager();
        assertNotNull(em);
        assertTrue(em.isOpen());
        em.close();
    }

    @Test
    void testSingletonPattern() {
        EntityManagerFactory emf1 = PersistenceManager.getEntityManagerFactory();
        EntityManagerFactory emf2 = PersistenceManager.getEntityManagerFactory();
        
        assertSame(emf1, emf2, "EntityManagerFactory should be a singleton");
    }

    @Test
    void testMultipleEntityManagers() {
        EntityManager em1 = PersistenceManager.getEntityManager();
        EntityManager em2 = PersistenceManager.getEntityManager();
        
        assertNotSame(em1, em2, "Each call should create a new EntityManager");
        
        em1.close();
        em2.close();
    }
}
