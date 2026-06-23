package com.university.offre.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "candidature-service")
public interface CandidatureServiceClient {

    @GetMapping("/api/candidatures/offre/{offreId}/stats")
    CandidatureStatsResponse getStatsByOffreId(
        @PathVariable("offreId") Long offreId,
        @RequestHeader("Authorization") String authorization
    );
}
