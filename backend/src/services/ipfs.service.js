import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import env from '../config/env.js';

/**
 * IPFS Service using Pinata API v1 (REST)
 * Direct API calls with JWT authentication
 */

const PINATA_API = 'https://api.pinata.cloud';

/**
 * Upload file to IPFS via Pinata REST API
 * @param {string} filePath - Path to the video file
 * @returns {Promise<string>} - IPFS CID
 */
export async function uploadToIPFS(filePath) {
  try {
    const jwt = env.PINATA_JWT;
    
    if (!jwt) {
      throw new Error('PINATA_JWT not configured in .env');
    }

    console.log(`\n📤 Starting IPFS upload via Pinata...`);
    console.log(`📁 File: ${path.basename(filePath)}`);
    
    // Get file info
    const fileName = path.basename(filePath);
    const stats = fs.statSync(filePath);
    const fileSize = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log(`📦 Size: ${fileSize} MB`);
    
    // Create form data
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath), fileName);
    
    // Optional: Add metadata
    const metadata = JSON.stringify({
      name: fileName,
      keyvalues: {
        project: 'VERITY',
        timestamp: Date.now().toString()
      }
    });
    formData.append('pinataMetadata', metadata);
    
    // Upload to Pinata
    console.log('⏳ Uploading to Pinata IPFS...');
    const startTime = Date.now();
    
    const response = await fetch(`${PINATA_API}/pinning/pinFileToIPFS`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwt}`,
        ...formData.getHeaders()
      },
      body: formData
    });

    console.log(`📡 Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    const cid = result.IpfsHash;
    
    console.log(`✅ Upload successful in ${duration}s!`);
    console.log(`📍 CID: ${cid}`);
    console.log(`🔗 Pinata Gateway: https://gateway.pinata.cloud/ipfs/${cid}`);
    console.log(`🔗 IPFS Gateway: https://ipfs.io/ipfs/${cid}`);
    
    return cid;
  } catch (error) {
    console.error('❌ Pinata upload error:', error);
    
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      throw new Error(
        'Pinata authentication failed. JWT token is invalid. ' +
        'Get a new one at https://app.pinata.cloud/developers/api-keys'
      );
    }
    
    if (error.message.includes('403') || error.message.includes('Forbidden')) {
      throw new Error(
        'Pinata access forbidden. JWT needs pinFileToIPFS permission.'
      );
    }
    
    throw new Error(`IPFS upload failed: ${error.message}`);
  }
}

/**
 * Retrieve file from IPFS via Pinata gateway
 * @param {string} cid - IPFS CID
 * @returns {Promise<string>} - Gateway URL
 */
export async function retrieveFromIPFS(cid) {
  return `https://gateway.pinata.cloud/ipfs/${cid}`;
}

/**
 * Get IPFS gateway URL for a CID
 * @param {string} cid - IPFS CID
 * @returns {string} - Gateway URL
 */
export function getIPFSUrl(cid) {
  return `https://gateway.pinata.cloud/ipfs/${cid}`;
}

/**
 * List pinned files on Pinata
 * @returns {Promise<Array>} - List of pinned files
 */
export async function listPinnedFiles() {
  try {
    const jwt = env.PINATA_JWT;
    const response = await fetch(`${PINATA_API}/data/pinList?status=pinned`, {
      headers: {
        'Authorization': `Bearer ${jwt}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`📋 Total pinned files: ${data.count}`);
      return data.rows;
    }
    return [];
  } catch (error) {
    console.error('Error listing files:', error);
    return [];
  }
}

/**
 * Unpin file from Pinata
 * @param {string} cid - IPFS CID to unpin
 * @returns {Promise<boolean>} - Success status
 */
export async function unpinFile(cid) {
  try {
    const jwt = env.PINATA_JWT;
    const response = await fetch(`${PINATA_API}/pinning/unpin/${cid}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${jwt}`
      }
    });

    if (response.ok) {
      console.log(`🗑️  Unpinned: ${cid}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error unpinning file:', error);
    return false;
  }
}
