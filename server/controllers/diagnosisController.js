// controllers/diagnosisController.js — Predict, History, GetRecord, DeleteRecord
const axios = require('axios');
const { DiagnosisRecord } = require('../models');
const { getPrediction } = require('../utils/mlBridge');
const logger = require('../utils/logger');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant';

/** Generate SHAP narrative from Groq */
async function generateShapNarrative(inputData, predictionData, lang = 'en') {
  if (!process.env.GROQ_API_KEY) {
    return 'AI narrative unavailable — GROQ_API_KEY not configured. Please consult a qualified doctor for a confirmed diagnosis.';
  }

  const topFeatures = predictionData.shap_values
    .slice(0, 3)
    .map(
      (f) =>
        `${f.feature} (value: ${f.value}, impact: ${f.shap_value > 0 ? '+' : ''}${f.shap_value.toFixed(3)})`
    )
    .join(', ');

  const systemPrompt = `You are a medical AI assistant specialized in thyroid health.
Your job is to explain a machine learning prediction to a patient in simple, clear, compassionate language.
Keep it 2-3 sentences. Do not use medical jargon. Do not say 'the model'. Say 'based on your test results'.
Always end with 'Please consult a qualified doctor for a confirmed diagnosis.'`;

  const userMessage = `Patient details:
- TSH: ${inputData.tsh}, T3: ${inputData.t3}, TT4: ${inputData.tt4}, FTI: ${inputData.fti}, Age: ${inputData.age}, Sex: ${inputData.sex}
- Prediction: ${predictionData.prediction} (confidence: ${predictionData.confidence}%)
- Top influencing factors: ${topFeatures}
Generate a patient-friendly explanation of this result.
Language: ${lang}`;

  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 200,
        temperature: 0.4,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );
    return response.data.choices[0].message.content.trim();
  } catch (err) {
    if (err.response) {
      logger.error('GROQ RAW ERROR:', {
        status: err.response.status,
        body: err.response.data,
      });
    } else {
      logger.error('Groq narrative generation failed', { error: err.message });
    }
    return 'Based on your test results, the AI analysis indicates the above prediction. Please consult a qualified doctor for a confirmed diagnosis.';
  }
}

// ─── POST /api/v1/diagnosis/predict ────────────────────────────────────────────
exports.predict = async (req, res, next) => {
  try {
    const { tsh, t3, tt4, fti, age, sex } = req.body;
    const userId = req.user.id;
    const lang = req.user.preferred_lang || 'en';

    logger.info('Prediction request', { userId, inputs: { tsh, t3, tt4, fti, age, sex } });

    // 1. Call Python ML service
    const mlResult = await getPrediction({ tsh, t3, tt4, fti, age, sex });

    // 2. Generate SHAP narrative via Groq
    const shap_narrative = await generateShapNarrative(
      { tsh, t3, tt4, fti, age, sex },
      mlResult,
      lang
    );

    // 3. Save to database
    const record = await DiagnosisRecord.create({
      user_id: userId,
      tsh: parseFloat(tsh),
      t3: parseFloat(t3),
      tt4: parseFloat(tt4),
      fti: parseFloat(fti),
      age: parseInt(age, 10),
      sex,
      prediction: mlResult.prediction,
      confidence: mlResult.confidence,
      shap_values: mlResult.shap_values,
      shap_narrative,
    });

    logger.info('Diagnosis saved', {
      userId,
      recordId: record.id,
      prediction: mlResult.prediction,
      confidence: mlResult.confidence,
    });

    return res.status(200).json({
      prediction: mlResult.prediction,
      confidence: mlResult.confidence,
      probabilities: mlResult.probabilities,
      shap_values: mlResult.shap_values,
      shap_narrative,
      record_id: record.id,
    });
  } catch (err) {
    // Surface ML service errors clearly
    if (err.message && err.message.includes('ML service')) {
      return res.status(503).json({ message: err.message });
    }
    next(err);
  }
};

// ─── GET /api/v1/diagnosis/history ─────────────────────────────────────────────
exports.getHistory = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const offset = (page - 1) * limit;

    const { count, rows } = await DiagnosisRecord.findAndCountAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
      limit,
      offset,
      attributes: [
        'id', 'tsh', 't3', 'tt4', 'fti', 'age', 'sex',
        'prediction', 'confidence', 'created_at',
      ],
    });

    return res.status(200).json({
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
      records: rows,
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/v1/diagnosis/history/:id ─────────────────────────────────────────
exports.getRecord = async (req, res, next) => {
  try {
    const record = await DiagnosisRecord.findOne({
      where: { id: req.params.id, user_id: req.user.id }, // ownership check
    });
    if (!record) {
      return res.status(404).json({ message: 'Record not found.' });
    }
    return res.status(200).json({ record });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/v1/diagnosis/history/:id ──────────────────────────────────────
exports.deleteRecord = async (req, res, next) => {
  try {
    const deleted = await DiagnosisRecord.destroy({
      where: { id: req.params.id, user_id: req.user.id }, // ownership check
    });
    if (!deleted) {
      return res.status(404).json({ message: 'Record not found.' });
    }
    logger.info('Diagnosis record deleted', { userId: req.user.id, recordId: req.params.id });
    return res.status(200).json({ message: 'Record deleted.' });
  } catch (err) {
    next(err);
  }
};
