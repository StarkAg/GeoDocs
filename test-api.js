const fetch = require('node-fetch');

const API_URL = 'http://localhost:3000';

async function testApi() {
  console.log('🧪 Testing PDF API Server...\n');
  
  // Test 1: Health check
  console.log('1️⃣ Testing health endpoint...');
  try {
    const healthResponse = await fetch(`${API_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('   ✅ Health check:', healthData);
  } catch (error) {
    console.error('   ❌ Health check failed:', error.message);
    console.error('   Make sure the API server is running: npm run api');
    process.exit(1);
  }
  
  // Test 2: Get PDF URL (using first village from filtered data)
  console.log('\n2️⃣ Testing PDF URL endpoint...');
  try {
    // Load test data
    const fs = require('fs');
    const data = JSON.parse(fs.readFileSync('complete-karnataka-data-filtered.json', 'utf8'));
    
    // Get first village
    const district = data[0];
    const taluk = district.taluks[0];
    const hobli = taluk.hoblis[0];
    const village = hobli.villages[0];
    
    console.log(`   Testing with:`);
    console.log(`     District: ${district.label} (${district.value})`);
    console.log(`     Taluk: ${taluk.label} (${taluk.value})`);
    console.log(`     Hobli: ${hobli.label} (${hobli.value})`);
    console.log(`     Village: ${village.label}`);
    console.log(`   Requesting PDF URL...`);
    
    const startTime = Date.now();
    const response = await fetch(`${API_URL}/api/get-pdf-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        district: district.value,
        taluk: taluk.value,
        hobli: hobli.value,
        village: village.label,
      }),
    });
    
    const result = await response.json();
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    if (result.success && result.pdfUrl) {
      console.log(`   ✅ PDF URL received in ${duration}s!`);
      console.log(`   📄 URL: ${result.pdfUrl.substring(0, 100)}...`);
      console.log(`   Full URL length: ${result.pdfUrl.length} characters`);
    } else {
      console.error('   ❌ Failed to get PDF URL:', result.error);
    }
  } catch (error) {
    console.error('   ❌ Request failed:', error.message);
  }
  
  // Test 3: Test with missing parameters
  console.log('\n3️⃣ Testing error handling (missing parameters)...');
  try {
    const response = await fetch(`${API_URL}/api/get-pdf-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        district: '2',
        // Missing taluk, hobli, village
      }),
    });
    
    const result = await response.json();
    if (result.error) {
      console.log('   ✅ Error handling works:', result.error);
    } else {
      console.log('   ⚠️  Expected error but got:', result);
    }
  } catch (error) {
    console.error('   ❌ Request failed:', error.message);
  }
  
  console.log('\n✅ API testing complete!');
}

// Run tests
testApi().catch(console.error);
