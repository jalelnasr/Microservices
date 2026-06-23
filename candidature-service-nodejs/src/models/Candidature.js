const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Candidature = sequelize.define('Candidature', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  offreId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    field: 'offre_id'
  },
  nomCandidat: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'nom_candidat'
  },
  emailCandidat: {
    type: DataTypes.STRING(150),
    allowNull: false,
    field: 'email_candidat',
    validate: {
      isEmail: true
    }
  },
  telephone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'telephone'
  },
  cvUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'cv_url'
  },
  lettreMotivation: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'lettre_motivation'
  },
  statut: {
    type: DataTypes.ENUM('EN_ATTENTE', 'EN_COURS', 'ACCEPTE', 'REFUSE'),
    defaultValue: 'EN_ATTENTE',
    allowNull: false
  },
  dateCandidature: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'date_candidature'
  },
  userId: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'user_id'
  }
}, {
  tableName: 'candidatures',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Candidature;
