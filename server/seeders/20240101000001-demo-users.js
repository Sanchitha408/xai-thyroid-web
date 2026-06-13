'use strict';
const { v4: uuidv4 } = require('crypto').webcrypto
  ? (() => { try { return require('uuid'); } catch { return { v4: () => require('crypto').randomUUID() }; } })()
  : { v4: () => require('crypto').randomUUID() };
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const passwordHash = await bcrypt.hash('Demo@1234', 12);

    const demoUserId = require('crypto').randomUUID();
    const doctorUserId = require('crypto').randomUUID();

    await queryInterface.bulkInsert('users', [
      {
        id: demoUserId,
        email: 'patient@demo.com',
        password_hash: passwordHash,
        full_name: 'Demo Patient',
        role: 'patient',
        preferred_lang: 'en',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: doctorUserId,
        email: 'doctor@demo.com',
        password_hash: passwordHash,
        full_name: 'Dr. Demo',
        role: 'doctor',
        preferred_lang: 'en',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // Seed a sample diagnosis record
    await queryInterface.bulkInsert('diagnosis_records', [
      {
        id: require('crypto').randomUUID(),
        user_id: demoUserId,
        tsh: 6.5,
        t3: 0.9,
        tt4: 55.0,
        fti: 52.0,
        age: 45,
        sex: 'Female',
        prediction: 'Hypothyroid',
        confidence: 88.5,
        shap_values: JSON.stringify([
          { feature: 'TSH Level', value: 6.5, shap_value: 0.42 },
          { feature: 'TT4 Level', value: 55.0, shap_value: -0.31 },
          { feature: 'FTI', value: 52.0, shap_value: -0.28 },
          { feature: 'T3 Level', value: 0.9, shap_value: -0.18 },
          { feature: 'Age', value: 45, shap_value: 0.09 },
          { feature: 'Sex', value: 1, shap_value: 0.05 },
        ]),
        shap_narrative:
          'Based on your test results, your TSH level is elevated and your T4 and FTI values are below the normal range, which are key indicators of an underactive thyroid. These patterns suggest hypothyroidism, meaning your thyroid may not be producing enough hormones for your body. Please consult a qualified doctor for a confirmed diagnosis.',
        created_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('diagnosis_records', null, {});
    await queryInterface.bulkDelete('users', null, {});
  },
};
