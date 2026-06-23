-- PostgreSQL Initialization Script for Candidature Service

-- Create candidatures table
CREATE TABLE IF NOT EXISTS candidatures (
    id BIGSERIAL PRIMARY KEY,
    offre_id BIGINT NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    nom_candidat VARCHAR(255) NOT NULL,
    email_candidat VARCHAR(255) NOT NULL,
    telephone VARCHAR(20),
    cv_url VARCHAR(500),
    lettre_motivation TEXT,
    statut VARCHAR(50) NOT NULL DEFAULT 'EN_ATTENTE',
    date_candidature TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_candidatures_offre_id ON candidatures(offre_id);
CREATE INDEX IF NOT EXISTS idx_candidatures_user_id ON candidatures(user_id);
CREATE INDEX IF NOT EXISTS idx_candidatures_statut ON candidatures(statut);
CREATE INDEX IF NOT EXISTS idx_candidatures_date_candidature ON candidatures(date_candidature);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_candidatures_updated_at 
    BEFORE UPDATE ON candidatures 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO candidatures (offre_id, user_id, nom_candidat, email_candidat, telephone, lettre_motivation, statut, date_candidature) VALUES
(1, 'user123', 'Jean Dupont', 'jean.dupont@email.com', '06.12.34.56.78', 'Je suis très intéressé par ce poste de développeur Full Stack. Mon expérience de 5 ans en Java et React me permettra de contribuer efficacement à vos projets.', 'EN_ATTENTE', NOW()),
(1, 'user456', 'Marie Martin', 'marie.martin@email.com', '06.98.76.54.32', 'Développeuse passionnée avec une solide expérience en développement web moderne. Motivée par les challenges techniques de votre entreprise.', 'ACCEPTEE', NOW() - INTERVAL '2 days'),
(2, 'user789', 'Pierre Durand', 'pierre.durand@email.com', '06.55.44.33.22', 'Architecte solutions avec 8 ans d''expérience dans le cloud computing. Certifié AWS et Azure, je souhaite mettre mes compétences au service de votre croissance.', 'EN_COURS_EVALUATION', NOW() - INTERVAL '1 day'),
(3, 'user321', 'Sophie Lambert', 'sophie.lambert@email.com', '06.11.22.33.44', 'Ingénieure DevOps experte en automatisation et orchestration. Passionnée par l''optimisation des processus de déploiement.', 'EN_ATTENTE', NOW() - INTERVAL '3 hours'),
(4, 'user654', 'Thomas Bernard', 'thomas.bernard@email.com', '06.77.88.99.00', 'Data Scientist avec un PhD en mathématiques appliquées. Expérience confirmée en machine learning et analyse prédictive.', 'REFUSEE', NOW() - INTERVAL '5 days');