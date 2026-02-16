const fs = require('fs');

// Read the extracted data (which has districts and taluks)
const extracted = JSON.parse(fs.readFileSync('extracted-data.json', 'utf8'));

// Map of website district values to our current structure
// Website values: 2=Bagalkote, 21=Bangalore Rural, 20=BANGALORE URBAN, 1=Belgaum, 12=BELLARY, etc.
const districtMap = {
  '2': 'BAGALKOT',
  '21': 'BANGALORE RURAL',
  '20': 'BANGALORE URBAN',
  '1': 'BELAGAVI',
  '12': 'BELLARY',
  '5': 'BIDAR',
  '3': 'BIJAPUR',
  '27': 'CHAMARAJANAGAR',
  '28': 'CHIKKABALLAPUR',
  '17': 'CHIKKAMAGALURU',
  '13': 'CHITRADURGA',
  '24': 'DAKSHINA KANNADA',
  '14': 'DAVANGERE',
  '9': 'DHARWAD',
  '8': 'GADAG',
  '4': 'GULBARGA',
  '23': 'HASSAN',
  '11': 'HAVERI',
  '25': 'KODAGU',
  '19': 'KOLAR',
  '7': 'KOPPAL',
  '22': 'MANDYA',
  '26': 'MYSORE',
  '6': 'RAICHUR',
  '29': 'RAMANAGARA',
  '15': 'SHIMOGA',
  '18': 'TUMAKURU',
  '16': 'UDUPI',
  '10': 'UTTARA KANNADA',
  '30': 'YADGIR'
};

console.log('Extracted data has:');
extracted.forEach(d => {
  console.log(`  ${d.label} (${d.value}): ${d.taluks.length} taluks`);
});

// Since we can't get hoblis programmatically easily, we'll keep the existing structure
// but update district values to match the website
console.log('\nNote: Hoblis need to be extracted manually or via WebView in the app.');
console.log('The current data structure will be preserved with correct district values.');

