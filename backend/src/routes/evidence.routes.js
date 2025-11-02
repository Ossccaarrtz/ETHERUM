import express from 'express';
import upload from '../middleware/upload.middleware.js';
import { uploadEvidence, getEvidenceByRecordId, getEvidenceByPlate } from '../controllers/evidence.controller.js';

const router = express.Router();

/**
 * POST /api/evidence/upload
 * Upload video evidence with plate number
 * 
 * Body (multipart/form-data):
 * - video: file (video file)
 * - plate: string (vehicle plate number)
 */
router.post('/upload', upload.single('video'), uploadEvidence);

/**
 * GET /api/evidence/verify/:recordId
 * Get evidence by recordId (for verification)
 */
router.get('/verify/:recordId', getEvidenceByRecordId);

/**
 * GET /api/evidence/plate/:plate
 * Get all evidence records for a specific vehicle plate
 */
router.get('/plate/:plate', getEvidenceByPlate);

/**
 * GET /api/evidence/:recordId
 * Get evidence by recordId (fallback route - must be last)
 */
router.get('/:recordId', getEvidenceByRecordId);

export default router;
