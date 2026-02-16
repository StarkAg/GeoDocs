# Chrome Console Script - Complete Data Extraction

## Quick Instructions

1. **Open Chrome** and navigate to: `https://landrecords.karnataka.gov.in/service3/`
2. **Open Developer Tools**: Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
3. **Go to Console tab**
4. **Copy the script below** and paste it into the console
5. **Press Enter** and wait (this will take 10-15 minutes)
6. **Copy the final JSON output** and save it to a file

## The Script

```javascript
(async function() {
  console.log('🚀 Starting data extraction...');
  
  const allData = [];
  
  // Get all districts
  const districtSelect = document.querySelector('select[name="ddl_district"]');
  const districts = Array.from(districtSelect.options)
    .filter(opt => opt.value !== '0' && opt.value !== 'All')
    .map(opt => ({
      value: opt.value,
      label: opt.text.trim()
    }));
  
  console.log(`✅ Found ${districts.length} districts`);
  
  // Helper function to wait
  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  
  // Helper function to trigger change event
  const triggerChange = (element) => {
    const event = new Event('change', { bubbles: true });
    element.dispatchEvent(event);
  };
  
  for (let i = 0; i < districts.length; i++) {
    const district = districts[i];
    console.log(`\n[${i + 1}/${districts.length}] Processing: ${district.label}`);
    
    // Select district
    districtSelect.value = district.value;
    triggerChange(districtSelect);
    await wait(3000); // Wait for taluks to load
    
    // Get taluks
    const talukSelect = document.querySelector('select[name="ddl_taluk"]');
    const taluks = Array.from(talukSelect.options)
      .filter(opt => opt.value !== '0' && opt.value !== 'All' && opt.value !== '--Select--')
      .map(opt => ({
        value: opt.value,
        label: opt.text.trim()
      }));
    
    console.log(`  📍 Found ${taluks.length} taluks`);
    
    const districtData = {
      value: district.value,
      label: district.label,
      taluks: []
    };
    
    for (let j = 0; j < taluks.length; j++) {
      const taluk = taluks[j];
      console.log(`    [${j + 1}/${taluks.length}] Processing taluk: ${taluk.label}`);
      
      // Select taluk
      talukSelect.value = taluk.value;
      triggerChange(talukSelect);
      await wait(3000); // Wait for hoblis to load
      
      // Get hoblis
      const hobliSelect = document.querySelector('select[name="ddl_hobli"]');
      const hoblis = Array.from(hobliSelect.options)
        .filter(opt => opt.value !== '0' && opt.value !== 'All' && opt.value !== '--Select--')
        .map(opt => ({
          value: opt.value,
          label: opt.text.trim()
        }));
      
      console.log(`      ✅ Found ${hoblis.length} hoblis`);
      
      districtData.taluks.push({
        value: taluk.value,
        label: taluk.label,
        hoblis: hoblis.map(h => ({
          value: h.value,
          label: h.label,
          villages: [] // Villages are text input
        }))
      });
      
      await wait(500); // Small delay
    }
    
    allData.push(districtData);
    console.log(`  ✅ Completed district: ${district.label}`);
    
    await wait(1000); // Delay between districts
  }
  
  console.log('\n🎉 Extraction complete!');
  console.log('\n📋 Final Data:');
  const dataStr = JSON.stringify(allData, null, 2);
  console.log(dataStr);
  
  // Copy to clipboard
  navigator.clipboard.writeText(dataStr).then(() => {
    console.log('\n✅ Data copied to clipboard!');
  }).catch(() => {
    console.log('\n⚠️  Could not copy to clipboard. Please copy the JSON above manually.');
  });
  
  // Also save to window for easy access
  window.extractedData = allData;
  console.log('\n💡 Data also saved to window.extractedData - you can access it anytime!');
  
  return allData;
})();
```

## After Running

1. The script will output progress in the console
2. When complete, it will print the full JSON
3. The data is also copied to your clipboard
4. You can also access it via `window.extractedData` in the console

## Save the Data

Copy the JSON output and save it to `complete-karnataka-data.json` in your project folder.

