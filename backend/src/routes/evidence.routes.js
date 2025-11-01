import express from 'express';
import upload from '../middleware/upload.middleware.js';
import { uploadEvidence } from '../controllers/evidence.controller.js';

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

export default router;
