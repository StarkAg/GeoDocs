const fs = require('fs');

console.log('🔍 Filtering hoblis without villages...\n');

// Read the original data
const data = JSON.parse(fs.readFileSync('complete-karnataka-data.json', 'utf8'));

console.log('Original data:');
const originalStats = {
  districts: data.length,
  taluks: data.reduce((sum, d) => sum + (d.taluks || []).length, 0),
  hoblis: data.reduce((sum, d) => sum + (d.taluks || []).reduce((s, t) => s + (t.hoblis || []).length, 0), 0),
  villages: data.reduce((sum, d) => sum + (d.taluks || []).reduce((s, t) => s + (t.hoblis || []).reduce((hSum, h) => hSum + (h.villages || []).length, 0), 0), 0)
};
console.log(`  Districts: ${originalStats.districts}`);
console.log(`  Taluks: ${originalStats.taluks}`);
console.log(`  Hoblis: ${originalStats.hoblis}`);
console.log(`  Villages: ${originalStats.villages}\n`);

// Filter: Remove hoblis with no villages, then remove taluks with no hoblis, then remove districts with no taluks
const filtered = data
  .map(district => ({
    ...district,
    taluks: (district.taluks || [])
      .map(taluk => ({
        ...taluk,
        hoblis: (taluk.hoblis || []).filter(hobli => 
          hobli.villages && hobli.villages.length > 0
        )
      }))
      .filter(taluk => taluk.hoblis.length > 0)
  }))
  .filter(district => district.taluks.length > 0);

console.log('Filtered data:');
const filteredStats = {
  districts: filtered.length,
  taluks: filtered.reduce((sum, d) => sum + (d.taluks || []).length, 0),
  hoblis: filtered.reduce((sum, d) => sum + (d.taluks || []).reduce((s, t) => s + (t.hoblis || []).length, 0), 0),
  villages: filtered.reduce((sum, d) => sum + (d.taluks || []).reduce((s, t) => s + (t.hoblis || []).reduce((hSum, h) => hSum + (h.villages || []).length, 0), 0), 0)
};
console.log(`  Districts: ${filteredStats.districts}`);
console.log(`  Taluks: ${filteredStats.taluks}`);
console.log(`  Hoblis: ${filteredStats.hoblis}`);
console.log(`  Villages: ${filteredStats.villages}\n`);

console.log('Removed:');
console.log(`  Districts: ${originalStats.districts - filteredStats.districts}`);
console.log(`  Taluks: ${originalStats.taluks - filteredStats.taluks}`);
console.log(`  Hoblis: ${originalStats.hoblis - filteredStats.hoblis}`);
console.log(`  Villages: ${originalStats.villages - filteredStats.villages} (should be 0)\n`);

// Save filtered data
const outputFile = 'complete-karnataka-data-filtered.json';
fs.writeFileSync(outputFile, JSON.stringify(filtered, null, 2), 'utf8');

console.log(`✅ Filtered data saved to: ${outputFile}`);
console.log(`   File size: ${(fs.statSync(outputFile).size / 1024).toFixed(2)} KB`);

