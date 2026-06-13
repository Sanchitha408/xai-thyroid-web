// models/ChatSession.js — Sequelize model for Groq chat sessions
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ChatSession = sequelize.define(
  'ChatSession',
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
    language: {
      type: DataTypes.STRING(10),
      defaultValue: 'en',
      validate: { isIn: [['en', 'hi', 'kn', 'ta', 'fr', 'es']] },
    },
    messages: {
      type: DataTypes.JSONB,
      defaultValue: [],
      // Structure: [{ role: 'user'|'assistant', content: string, timestamp: ISO8601 }]
    },
  },
  {
    tableName: 'chat_sessions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = ChatSession;
