import fs from 'fs';
import { hashFile } from '../services/hash.service.js';
import { uploadToIPFS } from '../services/ipfs.service.js';
import { saveRecord } from '../services/storage.service.js';
import { storeEvidenceOnChain } from '../services/blockchain.service.js';
import env from '../config/env.js';

/**
 * Evidence Controller
 * Handles upload and verification of fleet evidence
 */

/**
 * Upload evidence flow:
 * 1. Receive video (handled by multer)
 * 2. Hash the video
 * 3. Upload to IPFS
 * 4. Store in blockchain (stub for now)
 * 5. Save record locally
 * 6. Clean up temp file (optional)
 */
export async function uploadEvidence(req, res) {
  let filePath = null;

  try {
    // Validate file upload
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No video file provided',
      });
    }

    // Validate plate parameter
    const { plate } = req.body;
    if (!plate || plate.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Plate number is required',
      });
    }

    filePath = req.file.path;
    const timestamp = Math.floor(Date.now() / 1000); // Unix timestamp

    console.log(`\n🚀 Starting evidence upload for plate: ${plate}`);
    console.log(`📁 File: ${req.file.originalname}`);

    // Step 1: Hash the video
    console.log('🔐 Hashing video...');
    const hash = await hashFile(filePath);
    console.log(`✅ Hash: ${hash}`);

    // Step 2: Upload to IPFS
    console.log('☁️  Uploading to IPFS...');
    const cid = await uploadToIPFS(filePath);
    console.log(`✅ CID: ${cid}`);

    // Step 3: Store on blockchain (stub for now)
    console.log('⛓️  Storing on blockchain...');
    const { scrollTx, arbitrumTx } = await storeEvidenceOnChain(
      plate,
      timestamp,
      cid
    );
    console.log(`✅ Scroll TX: ${scrollTx}`);
    console.log(`✅ Arbitrum TX: ${arbitrumTx}`);

    // Step 4: Save record locally
    console.log('💾 Saving record...');
    const record = saveRecord({
      plate,
      timestamp,
      hash,
      cid,
      scrollTx,
      arbitrumTx,
      fileName: req.file.originalname,
      fileSize: req.file.size,
    });

    // Step 5: Clean up temp file (optional)
    if (env.DELETE_TEMP_FILES && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('🗑️  Temp file deleted');
    }

    // Success response
    return res.status(200).json({
      success: true,
      hash,
      cid,
      timestamp,
      scrollTx,
      arbitrumTx,
      recordId: record.id,
    });

  } catch (error) {
    console.error('❌ Upload error:', error);

    // Clean up file on error
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return res.status(500).json({
      success: false,
      error: error.message || 'Evidence upload failed',
    });
  }
}
