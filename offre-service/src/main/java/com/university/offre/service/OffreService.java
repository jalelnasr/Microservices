package com.university.offre.service;

import com.university.offre.config.RabbitMQConfig;
import com.university.offre.model.Offre;
import com.university.offre.repository.OffreRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class OffreService {
    
    private final OffreRepository offreRepository;
    private final RabbitTemplate rabbitTemplate;
    
    public List<Offre> getAllOffres() {
        return offreRepository.findAll();
    }
    
    public Offre getOffreById(Long id) {
        return offreRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Offre not found with id: " + id));
    }
    
    @Transactional
    public Offre createOffre(Offre offre) {
        offre.setCreatedAt(LocalDateTime.now());
        offre.setUpdatedAt(LocalDateTime.now());
        Offre savedOffre = offreRepository.save(offre);
        
        // Publier événement async - Nouvelle offre créée
        publishOffreCreatedEvent(savedOffre);
        
        log.info("Offre created with ID: {}", savedOffre.getId());
        return savedOffre;
    }
    
    @Transactional
    public Offre updateOffre(Long id, Offre offre) {
        Offre existingOffre = getOffreById(id);
        existingOffre.setTitre(offre.getTitre());
        existingOffre.setDescription(offre.getDescription());
        existingOffre.setEntreprise(offre.getEntreprise());
        existingOffre.setLocalisation(offre.getLocalisation());
        existingOffre.setTypeContrat(offre.getTypeContrat());
        existingOffre.setSalaire(offre.getSalaire());
        existingOffre.setStatut(offre.getStatut());
        existingOffre.setUpdatedAt(LocalDateTime.now());
        
        return offreRepository.save(existingOffre);
    }
    
    public void deleteOffre(Long id) {
        offreRepository.deleteById(id);
        log.info("Offre deleted with ID: {}", id);
    }
    
    public List<Offre> searchOffres(String keyword) {
        return offreRepository.searchOffres(keyword);
    }
    
    public boolean offreExists(Long id) {
        return offreRepository.existsById(id);
    }
    
    private void publishOffreCreatedEvent(Offre offre) {
        try {
            Map<String, Object> event = new HashMap<>();
            event.put("offreId", offre.getId());
            event.put("titre", offre.getTitre());
            event.put("entreprise", offre.getEntreprise());
            event.put("datePublication", offre.getDatePublication().toString());
            
            rabbitTemplate.convertAndSend(
                RabbitMQConfig.OFFRE_EXCHANGE,
                RabbitMQConfig.OFFRE_CREATED_ROUTING_KEY,
                event
            );
            
            log.info("Published offre created event for ID: {}", offre.getId());
        } catch (Exception e) {
            log.error("Error publishing offre created event", e);
        }
    }
}
