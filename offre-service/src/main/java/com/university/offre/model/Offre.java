package com.university.offre.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "offres")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Offre {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String titre;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false)
    private String entreprise;
    
    private String localisation;
    
    @Column(nullable = false)
    private String typeContrat;
    
    private Double salaire;
    
    @Column(nullable = false)
    private String statut = "ACTIVE";
    
    @Column(name = "date_publication")
    private LocalDateTime datePublication = LocalDateTime.now();
    
    @Column(name = "date_expiration")
    private LocalDateTime dateExpiration;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
}
