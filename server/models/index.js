// models/index.js — Initialize Sequelize, define associations
const sequelize = require('../config/db');
const User = require('./User');
const DiagnosisRecord = require('./DiagnosisRecord');
const ChatSession = require('./ChatSession');

// ─── Associations ──────────────────────────────────────────────────────────────
// User → DiagnosisRecords (1:many)
User.hasMany(DiagnosisRecord, { foreignKey: 'user_id', as: 'diagnoses', onDelete: 'CASCADE' });
DiagnosisRecord.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User → ChatSessions (1:many)
User.hasMany(ChatSession, { foreignKey: 'user_id', as: 'chatSessions', onDelete: 'CASCADE' });
ChatSession.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = { sequelize, User, DiagnosisRecord, ChatSession };
