-- MySQL Initialization Script for Offre Service

CREATE DATABASE IF NOT EXISTS offre_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE offre_db;

-- Create offres table if not exists
CREATE TABLE IF NOT EXISTS offres (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    description TEXT,
    entreprise VARCHAR(255) NOT NULL,
    localisation VARCHAR(255),
    type_contrat VARCHAR(100) NOT NULL,
    salaire DECIMAL(10,2),
    statut VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    date_publication TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_expiration TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_titre (titre),
    INDEX idx_entreprise (entreprise),
    INDEX idx_statut (statut),
    INDEX idx_date_publication (date_publication)
);

-- Insert sample data
INSERT INTO offres (titre, description, entreprise, localisation, type_contrat, salaire, statut, date_publication) VALUES
('Développeur Full Stack Java/React', 'Recherche développeur expérimenté en Java Spring Boot et React pour rejoindre notre équipe de développement.', 'TechCorp Solutions', 'Paris, France', 'CDI', 55000.00, 'ACTIVE', NOW()),
('Architecte Solutions Cloud', 'Nous recherchons un architecte solutions spécialisé dans les technologies cloud (AWS, Azure) pour concevoir nos infrastructures.', 'CloudFirst Consulting', 'Lyon, France', 'CDI', 75000.00, 'ACTIVE', NOW()),
('DevOps Engineer Senior', 'Rejoignez notre équipe DevOps pour automatiser et optimiser nos pipelines CI/CD avec Docker, Kubernetes et Terraform.', 'InnovateTech', 'Toulouse, France', 'CDI', 65000.00, 'ACTIVE', NOW()),
('Data Scientist Python', 'Analysez et modélisez nos données avec Python, pandas, scikit-learn pour optimiser nos processus métier.', 'DataDriven Analytics', 'Nantes, France', 'CDD', 48000.00, 'ACTIVE', NOW()),
('Consultant Cybersécurité', 'Mission de consulting en sécurité informatique, audit et mise en place de solutions de protection.', 'SecureIT Consulting', 'Remote', 'FREELANCE', 70000.00, 'ACTIVE', NOW());

-- Grant permissions
GRANT ALL PRIVILEGES ON offre_db.* TO 'offre_user'@'%';
FLUSH PRIVILEGES;