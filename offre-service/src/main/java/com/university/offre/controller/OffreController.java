package com.university.offre.controller;

import com.university.offre.client.CandidatureServiceClient;
import com.university.offre.client.CandidatureStatsResponse;
import com.university.offre.model.Offre;
import com.university.offre.service.OffreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/offres")
@RequiredArgsConstructor
public class OffreController {
    
    private final OffreService offreService;
    private final CandidatureServiceClient candidatureServiceClient;
    
    @GetMapping
    public ResponseEntity<List<Offre>> getAllOffres() {
        return ResponseEntity.ok(offreService.getAllOffres());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Offre> getOffreById(@PathVariable Long id) {
        return ResponseEntity.ok(offreService.getOffreById(id));
    }
    
    @GetMapping("/{id}/exists")
    public ResponseEntity<Boolean> offreExists(@PathVariable Long id) {
        return ResponseEntity.ok(offreService.offreExists(id));
    }

    @GetMapping("/{id}/stats-candidatures")
    public ResponseEntity<CandidatureStatsResponse> getCandidatureStats(
        @PathVariable Long id,
        @RequestHeader("Authorization") String authorization
    ) {
        return ResponseEntity.ok(candidatureServiceClient.getStatsByOffreId(id, authorization));
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECRUITER')")
    public ResponseEntity<Offre> createOffre(@RequestBody Offre offre) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(offreService.createOffre(offre));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECRUITER')")
    public ResponseEntity<Offre> updateOffre(@PathVariable Long id, @RequestBody Offre offre) {
        return ResponseEntity.ok(offreService.updateOffre(id, offre));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECRUITER')")
    public ResponseEntity<Void> deleteOffre(@PathVariable Long id) {
        offreService.deleteOffre(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<Offre>> searchOffres(@RequestParam String keyword) {
        return ResponseEntity.ok(offreService.searchOffres(keyword));
    }
}
