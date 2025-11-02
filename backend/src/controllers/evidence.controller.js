import fs from 'fs';
import { hashFile } from '../services/hash.service.js';
import { uploadToIPFS } from '../services/ipfs.service.js';
import { saveRecord, findRecordByRecordId, getRecordsByPlate, getAllRecords } from '../services/storage.service.js';
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
 * 4. Store in blockchain (both Scroll and Arbitrum)
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
    console.log(`📂 File path: ${filePath}`);

    // Verify file exists
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      return res.status(400).json({
        success: false,
        error: `File not found: ${filePath}. The uploaded file may not have been saved correctly.`,
      });
    }

    // Step 1: Hash the video
    console.log('🔐 Hashing video...');
    const hash = await hashFile(filePath);
    console.log(`✅ Hash: ${hash}`);

    // Step 2: Upload to IPFS
    console.log('☁️  Uploading to IPFS...');
    const cid = await uploadToIPFS(filePath);
    console.log(`✅ CID: ${cid}`);

    // Generate unique record ID
    const recordId = `${plate}-${timestamp}`;
    console.log(`🆔 Record ID: ${recordId}`);

    // Step 3: Store on blockchain (both Scroll and Arbitrum)
    console.log('⛓️  Storing on blockchain...');
    const { scrollTx, arbitrumTx } = await storeEvidenceOnChain(
      recordId,
      plate,
      cid,
      hash
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
      recordId,
      fileName: req.file.originalname,
      fileSize: req.file.size,
    });

    // Step 5: Clean up temp file (optional)
    if (env.DELETE_TEMP_FILES && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('🗑️  Temp file deleted');
    }

    console.log('✨ Evidence upload complete!\n');

    // Success response
    return res.status(200).json({
      success: true,
      recordId, // PLATE-TIMESTAMP format (search criteria)
      hash,
      cid,
      timestamp,
      scrollTx,
      arbitrumTx,
      localId: record.id, // Local DB record ID
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

/**
 * GET /api/evidence/:recordId
 * Get evidence by recordId from local database
 */
export async function getEvidenceByRecordId(req, res) {
  try {
    const { recordId } = req.params;

    if (!recordId) {
      return res.status(400).json({
        success: false,
        error: 'Record ID is required',
      });
    }

    const record = findRecordByRecordId(recordId);

    if (!record) {
      return res.status(404).json({
        success: false,
        error: 'Record not found',
      });
    }

    // Helper function to generate blockchain explorer URLs
    const getExplorerUrl = (txHash, network) => {
      if (txHash && txHash.startsWith('0x') && txHash.length === 66 && !txHash.includes('error') && !txHash.includes('mock') && !txHash.includes('notconfigured')) {
        if (network === 'scroll') {
          return `https://sepolia.scrollscan.com/tx/${txHash}`;
        } else if (network === 'arbitrum') {
          return `https://sepolia.arbiscan.io/tx/${txHash}`;
        }
      }
      return null;
    };

    // Return in format similar to blockchain response
    return res.status(200).json({
      success: true,
      recordId: record.recordId,
      plate: record.plate,
      licencePlate: record.plate, // Alias for compatibility
      ipfsHash: record.cid,
      ipfsCid: record.cid,
      fileHash: record.hash,
      hash: record.hash,
      timestamp: record.timestamp,
      scrollTx: record.scrollTx,
      arbitrumTx: record.arbitrumTx,
      scrollExplorerUrl: getExplorerUrl(record.scrollTx, 'scroll'),
      arbitrumExplorerUrl: getExplorerUrl(record.arbitrumTx, 'arbitrum'),
      fileName: record.fileName,
      fileSize: record.fileSize,
      createdAt: record.createdAt,
      source: 'local' // Indicate this came from local DB, not blockchain
    });

  } catch (error) {
    console.error('❌ Get evidence error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to get evidence',
    });
  }
}

/**
 * GET /api/evidence/plate/:plate
 * Get all evidence records for a specific vehicle plate
 */
export async function getEvidenceByPlate(req, res) {
  try {
    const { plate } = req.params;

    if (!plate) {
      return res.status(400).json({
        success: false,
        error: 'Plate number is required',
      });
    }

    const records = getRecordsByPlate(plate);

    // Always return 200, even if no records found (for better frontend handling)
    if (records.length === 0) {
      return res.status(200).json({
        success: true,
        plate,
        count: 0,
        records: [],
        message: 'No records found for this plate',
      });
    }

    // Helper function to generate blockchain explorer URLs
    const getExplorerUrl = (txHash, network) => {
      if (txHash && txHash.startsWith('0x') && txHash.length === 66 && !txHash.includes('error') && !txHash.includes('mock') && !txHash.includes('notconfigured')) {
        if (network === 'scroll') {
          return `https://sepolia.scrollscan.com/tx/${txHash}`;
        } else if (network === 'arbitrum') {
          return `https://sepolia.arbiscan.io/tx/${txHash}`;
        }
      }
      return null;
    };

    // Return records in format similar to blockchain response
    const formattedRecords = records.map(record => ({
      recordId: record.recordId,
      plate: record.plate,
      licencePlate: record.plate,
      ipfsHash: record.cid,
      ipfsCid: record.cid,
      fileHash: record.hash,
      hash: record.hash,
      timestamp: record.timestamp,
      scrollTx: record.scrollTx,
      arbitrumTx: record.arbitrumTx,
      scrollExplorerUrl: getExplorerUrl(record.scrollTx, 'scroll'),
      arbitrumExplorerUrl: getExplorerUrl(record.arbitrumTx, 'arbitrum'),
      fileName: record.fileName,
      fileSize: record.fileSize,
      createdAt: record.createdAt,
      source: 'local'
    }));

    return res.status(200).json({
      success: true,
      plate,
      count: formattedRecords.length,
      records: formattedRecords,
    });

  } catch (error) {
    console.error('❌ Get evidence by plate error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to get evidence by plate',
    });
  }
}

/**
 * GET /api/evidence/all
 * Get all evidence records
 */
export async function getAllEvidence(req, res) {
  try {
    const records = getAllRecords();

    if (records.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        records: [],
      });
    }

    // Helper function to generate blockchain explorer URLs
    const getExplorerUrl = (txHash, network) => {
      if (txHash && txHash.startsWith('0x') && txHash.length === 66 && !txHash.includes('error') && !txHash.includes('mock') && !txHash.includes('notconfigured')) {
        if (network === 'scroll') {
          return `https://sepolia.scrollscan.com/tx/${txHash}`;
        } else if (network === 'arbitrum') {
          return `https://sepolia.arbiscan.io/tx/${txHash}`;
        }
      }
      return null;
    };

    // Return records in format similar to blockchain response
    const formattedRecords = records.map(record => ({
      recordId: record.recordId,
      plate: record.plate,
      licencePlate: record.plate,
      ipfsHash: record.cid,
      ipfsCid: record.cid,
      fileHash: record.hash,
      hash: record.hash,
      timestamp: record.timestamp,
      scrollTx: record.scrollTx,
      arbitrumTx: record.arbitrumTx,
      scrollExplorerUrl: getExplorerUrl(record.scrollTx, 'scroll'),
      arbitrumExplorerUrl: getExplorerUrl(record.arbitrumTx, 'arbitrum'),
      fileName: record.fileName,
      fileSize: record.fileSize,
      createdAt: record.createdAt,
      source: 'local'
    }));

    return res.status(200).json({
      success: true,
      count: formattedRecords.length,
      records: formattedRecords,
    });

  } catch (error) {
    console.error('❌ Get all evidence error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to get all evidence',
    });
  }
}
