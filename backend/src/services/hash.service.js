import crypto from 'crypto';
import fs from 'fs';

/**
 * Hash Service
 * Generates SHA-256 hash from video files
 */

/**
 * Generate SHA-256 hash from file
 * @param {string} filePath - Path to the video file
 * @returns {Promise<string>} - Hex hash string
 */
export async function hashFile(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);

    stream.on('data', (chunk) => {
      hash.update(chunk);
    });

    stream.on('end', () => {
      resolve(hash.digest('hex'));
    });

    stream.on('error', (err) => {
      reject(new Error(`Hash generation failed: ${err.message}`));
    });
  });
}

/**
 * Generate SHA-256 hash from buffer
 * @param {Buffer} buffer - File buffer
 * @returns {string} - Hex hash string
 */
export function hashBuffer(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}
