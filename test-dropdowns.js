/**
 * Test script to verify dropdown options fetching
 */

const {fetchDistricts, fetchTaluks, fetchHoblis} = require('./src/services/dropdownOptionsService.ts');

async function testDropdowns() {
  console.log('Testing dropdown options fetching...\n');
  
  try {
    // Test 1: Fetch districts
    console.log('1. Fetching districts...');
    const districts = await fetchDistricts();
    console.log(`   ✓ Found ${districts.length} districts`);
    console.log(`   Sample districts:`, districts.slice(0, 5).map(d => d.label).join(', '));
    
    if (districts.length > 0) {
      const testDistrict = districts[0];
      console.log(`\n2. Testing with district: ${testDistrict.label} (${testDistrict.value})`);
      
      // Test 2: Fetch taluks for first district
      console.log('   Fetching taluks...');
      const taluks = await fetchTaluks(testDistrict.value);
      console.log(`   ✓ Found ${taluks.length} taluks`);
      console.log(`   Sample taluks:`, taluks.slice(0, 5).map(t => t.label).join(', '));
      
      if (taluks.length > 0) {
        const testTaluk = taluks[0];
        console.log(`\n3. Testing with taluk: ${testTaluk.label} (${testTaluk.value})`);
        
        // Test 3: Fetch hoblis
        console.log('   Fetching hoblis...');
        const hoblis = await fetchHoblis(testDistrict.value, testTaluk.value);
        console.log(`   ✓ Found ${hoblis.length} hoblis`);
        console.log(`   Sample hoblis:`, hoblis.slice(0, 5).map(h => h.label).join(', '));
      }
    }
    
    console.log('\n✓ All tests completed successfully!');
  } catch (error) {
    console.error('✗ Error:', error.message);
    console.error(error.stack);
  }
}

testDropdowns();

