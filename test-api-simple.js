// Simple API test - just health check
const http = require('http');

console.log('🧪 Testing API Server...\n');

// Test health endpoint
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/health',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('✅ Health Check Response:');
    console.log('   Status:', res.statusCode);
    console.log('   Body:', JSON.parse(data));
    
    if (res.statusCode === 200) {
      console.log('\n✅ API server is running!');
      console.log('\nTo test PDF extraction, make sure the API server is running with:');
      console.log('  npm run api');
      console.log('\nThen in another terminal, run:');
      console.log('  node test-api.js');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Connection failed:', error.message);
  console.error('\nMake sure the API server is running:');
  console.error('  npm run api');
});

req.end();

