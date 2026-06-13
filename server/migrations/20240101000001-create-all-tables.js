'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ── users table ──────────────────────────────────────────────────────────
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      password_hash: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      full_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      role: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'patient',
      },
      preferred_lang: {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: 'en',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    // ── diagnosis_records table ──────────────────────────────────────────────
    await queryInterface.createTable('diagnosis_records', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      tsh: {
        type: Sequelize.DECIMAL(8, 3),
        allowNull: false,
      },
      t3: {
        type: Sequelize.DECIMAL(8, 3),
        allowNull: false,
      },
      tt4: {
        type: Sequelize.DECIMAL(8, 3),
        allowNull: false,
      },
      fti: {
        type: Sequelize.DECIMAL(8, 3),
        allowNull: false,
      },
      age: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      sex: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      prediction: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      confidence: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
      },
      shap_values: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: '[]',
      },
      shap_narrative: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    // ── chat_sessions table ──────────────────────────────────────────────────
    await queryInterface.createTable('chat_sessions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      language: {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: 'en',
      },
      messages: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: '[]',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    // ── Indexes ──────────────────────────────────────────────────────────────
    await queryInterface.addIndex('diagnosis_records', ['user_id'], {
      name: 'idx_diagnosis_user_id',
    });
    await queryInterface.addIndex('diagnosis_records', ['created_at'], {
      name: 'idx_diagnosis_created_at',
    });
    await queryInterface.addIndex('chat_sessions', ['user_id'], {
      name: 'idx_chat_user_id',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('chat_sessions');
    await queryInterface.dropTable('diagnosis_records');
    await queryInterface.dropTable('users');
  },
};
