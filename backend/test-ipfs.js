/**
 * Test script for Pinata REST API
 * Run with: node test-ipfs.js
 */

import fetch from 'node-fetch';
import FormData from 'form-data';
import dotenv from 'dotenv';

// Load .env
dotenv.config();

const jwt = process.env.PINATA_JWT;
const PINATA_API = 'https://api.pinata.cloud';

console.log('\n🧪 Pinata REST API Test\n');
console.log('━'.repeat(60));

// Check JWT
if (!jwt) {
  console.error('❌ PINATA_JWT not found in .env file');
  console.error('\n📋 Steps to fix:');
  console.error('   1. Go to: https://app.pinata.cloud/developers/api-keys');
  console.error('   2. Click "New Key"');
  console.error('   3. Select "Admin" permissions');
  console.error('   4. Copy the JWT token');
  console.error('   5. Add to .env: PINATA_JWT=your_jwt_here\n');
  process.exit(1);
}

console.log('✅ JWT found in .env');
console.log(`📝 Token preview: ${jwt.substring(0, 30)}...`);
console.log(`📏 Token length: ${jwt.length} characters`);

// Validate JWT format
if (!jwt.startsWith('eyJ')) {
  console.warn('\n⚠️  Warning: Token doesn\'t start with "eyJ"');
  console.warn('   Make sure you copied the JWT, not the API Key or Secret\n');
}

// Create test content
console.log('\n📝 Creating test content...');
const testContent = `VERITY Test Upload
Timestamp: ${new Date().toISOString()}
Test ID: ${Math.random().toString(36).substring(7)}`;

console.log(`✅ Test content created (${testContent.length} bytes)`);

// Create form data
const formData = new FormData();
formData.append('file', Buffer.from(testContent), {
  filename: 'verity-test.txt',
  contentType: 'text/plain'
});

const metadata = JSON.stringify({
  name: 'VERITY Test',
  keyvalues: {
    project: 'VERITY',
    test: 'true'
  }
});
formData.append('pinataMetadata', metadata);

// Upload to Pinata
console.log('\n⏳ Uploading to Pinata IPFS...');
console.log('   This may take a few seconds...\n');

try {
  const startTime = Date.now();
  
  const response = await fetch(`${PINATA_API}/pinning/pinFileToIPFS`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${jwt}`,
      ...formData.getHeaders()
    },
    body: formData
  });

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  console.log(`📡 Response status: ${response.status} ${response.statusText}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('\n❌ Upload failed!');
    console.error('Response:', errorText);
    
    if (response.status === 401) {
      console.error('\n🔐 Authentication Error');
      console.error('   Your JWT token is invalid or expired.');
      console.error('\n📋 Solutions:');
      console.error('   1. Go to: https://app.pinata.cloud/developers/api-keys');
      console.error('   2. Delete the old key');
      console.error('   3. Create a new key with "Admin" permissions');
      console.error('   4. Copy the NEW JWT token');
      console.error('   5. Update your .env file');
      console.error('   6. Restart the test\n');
    } else if (response.status === 403) {
      console.error('\n🚫 Permission Error');
      console.error('   Your JWT doesn\'t have upload permissions.');
      console.error('   Create a new key with "pinFileToIPFS" permission.\n');
    } else if (response.status === 402) {
      console.error('\n💳 Storage Limit Reached');
      console.error('   Your free 1GB limit is full.');
      console.error('   Delete old files or upgrade your plan.\n');
    }
    
    process.exit(1);
  }

  const result = await response.json();
  const cid = result.IpfsHash;
  const timestamp = result.Timestamp;

  console.log('\n🎉 SUCCESS! Upload completed in ' + duration + 's\n');
  console.log('━'.repeat(60));
  console.log(`📍 CID: ${cid}`);
  console.log(`⏰ Timestamp: ${timestamp}`);
  console.log(`📊 Size: ${result.PinSize} bytes`);
  console.log('\n🔗 View your test file at:');
  console.log(`   https://gateway.pinata.cloud/ipfs/${cid}`);
  console.log(`   https://ipfs.io/ipfs/${cid}`);
  console.log('━'.repeat(60));
  console.log('\n✅ Pinata is configured correctly!');
  console.log('✅ Your backend is ready to upload videos.\n');

  // Test listing files
  console.log('📋 Testing file list...');
  const listResponse = await fetch(`${PINATA_API}/data/pinList?status=pinned&pageLimit=5`, {
    headers: {
      'Authorization': `Bearer ${jwt}`
    }
  });

  if (listResponse.ok) {
    const listData = await listResponse.json();
    console.log(`✅ Found ${listData.count} pinned files on your account`);
  }

  console.log('');

} catch (error) {
  console.error('\n❌ Unexpected error!\n');
  console.error('Error:', error.message);
  
  if (error.code === 'ENOTFOUND' || error.message.includes('fetch')) {
    console.error('\n🌐 Network Error');
    console.error('   Check your internet connection.');
    console.error('   Pinata service might be temporarily unavailable.\n');
  } else {
    console.error('\nFull error:', error);
    console.error('');
  }
  
  process.exit(1);
}
