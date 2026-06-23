package com.university.offre.repository;

import com.university.offre.model.Offre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OffreRepository extends JpaRepository<Offre, Long> {
    
    List<Offre> findByStatut(String statut);
    
    List<Offre> findByEntreprise(String entreprise);
    
    @Query("SELECT o FROM Offre o WHERE o.titre LIKE %?1% OR o.description LIKE %?1%")
    List<Offre> searchOffres(String keyword);
}
