// models/User.js — Sequelize User model (OWASP: never return password_hash)
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true,
      },
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [2, 100],
        notEmpty: true,
      },
    },
    role: {
      type: DataTypes.STRING(20),
      defaultValue: 'patient',
      validate: {
        isIn: [['patient', 'doctor', 'admin']],
      },
    },
    preferred_lang: {
      type: DataTypes.STRING(10),
      defaultValue: 'en',
      validate: {
        isIn: [['en', 'hi', 'kn', 'ta', 'fr', 'es']],
      },
    },
  },
  {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = User;
