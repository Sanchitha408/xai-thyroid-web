// models/DiagnosisRecord.js — Sequelize model for diagnosis results
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const DiagnosisRecord = sequelize.define(
  'DiagnosisRecord',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    tsh: {
      type: DataTypes.DECIMAL(8, 3),
      allowNull: false,
      validate: { min: 0, max: 30 },
    },
    t3: {
      type: DataTypes.DECIMAL(8, 3),
      allowNull: false,
      validate: { min: 0, max: 15 },
    },
    tt4: {
      type: DataTypes.DECIMAL(8, 3),
      allowNull: false,
      validate: { min: 0, max: 300 },
    },
    fti: {
      type: DataTypes.DECIMAL(8, 3),
      allowNull: false,
      validate: { min: 0, max: 400 },
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 120 },
    },
    sex: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: { isIn: [['Male', 'Female']] },
    },
    prediction: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: { isIn: [['Normal', 'Hypothyroid', 'Hyperthyroid']] },
    },
    confidence: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      validate: { min: 0, max: 100 },
    },
    shap_values: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    shap_narrative: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'diagnosis_records',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false, // no updated_at on diagnosis records
  }
);

module.exports = DiagnosisRecord;
