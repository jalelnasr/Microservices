package com.university.gateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.*;

import java.util.Arrays;
import java.util.List;

@Configuration
public class JwtConfig {

    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri:http://keycloak:8180/realms/microservices-realm}")
    private String issuerUri;

    @Bean
    public ReactiveJwtDecoder jwtDecoder() {
        // Use the internal Docker URL for fetching JWK keys
        String jwkSetUri = issuerUri.replace("/realms/", "/realms/") + "/protocol/openid-connect/certs";
        
        NimbusReactiveJwtDecoder jwtDecoder = NimbusReactiveJwtDecoder
            .withJwkSetUri(jwkSetUri)
            .build();

        // Create a custom validator that accepts multiple issuers
        OAuth2TokenValidator<Jwt> customValidator = new DelegatingOAuth2TokenValidator<>(
            // Accept tokens from both localhost and Docker internal hostname
            token -> {
                String tokenIssuer = token.getIssuer().toString();
                List<String> validIssuers = Arrays.asList(
                    "http://localhost:8180/realms/microservices-realm",
                    "http://keycloak:8180/realms/microservices-realm"
                );
                
                if (validIssuers.stream().anyMatch(tokenIssuer::equals)) {
                    return OAuth2TokenValidatorResult.success();
                }
                
                return OAuth2TokenValidatorResult.failure(
                    new OAuth2Error("invalid_token", "Invalid issuer: " + tokenIssuer, null)
                );
            },
            new JwtTimestampValidator()
        );

        jwtDecoder.setJwtValidator(customValidator);
        return jwtDecoder;
    }
}
