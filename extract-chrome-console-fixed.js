(async function() {
  console.log('Starting data extraction...');
  
  const allData = [];
  
  // Get all districts
  const districtSelect = document.querySelector('select[name="ddl_district"]');
  const districts = Array.from(districtSelect.options)
    .filter(opt => opt.value !== '0' && opt.value !== 'All')
    .map(opt => ({
      value: opt.value,
      label: opt.text.trim()
    }));
  
  console.log('Found ' + districts.length + ' districts');
  
  // Helper function to wait
  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  
  // Helper function to trigger change event
  const triggerChange = (element) => {
    const event = new Event('change', { bubbles: true });
    element.dispatchEvent(event);
  };
  
  for (let i = 0; i < districts.length; i++) {
    const district = districts[i];
    console.log('[' + (i + 1) + '/' + districts.length + '] Processing: ' + district.label);
    
    // Select district
    districtSelect.value = district.value;
    triggerChange(districtSelect);
    await wait(3000);
    
    // Get taluks
    const talukSelect = document.querySelector('select[name="ddl_taluk"]');
    const taluks = Array.from(talukSelect.options)
      .filter(opt => opt.value !== '0' && opt.value !== 'All' && opt.value !== '--Select--')
      .map(opt => ({
        value: opt.value,
        label: opt.text.trim()
      }));
    
    console.log('  Found ' + taluks.length + ' taluks');
    
    const districtData = {
      value: district.value,
      label: district.label,
      taluks: []
    };
    
    for (let j = 0; j < taluks.length; j++) {
      const taluk = taluks[j];
      console.log('    [' + (j + 1) + '/' + taluks.length + '] Processing taluk: ' + taluk.label);
      
      // Select taluk
      talukSelect.value = taluk.value;
      triggerChange(talukSelect);
      await wait(3000);
      
      // Get hoblis
      const hobliSelect = document.querySelector('select[name="ddl_hobli"]');
      const hoblis = Array.from(hobliSelect.options)
        .filter(opt => opt.value !== '0' && opt.value !== 'All' && opt.value !== '--Select--')
        .map(opt => ({
          value: opt.value,
          label: opt.text.trim()
        }));
      
      console.log('      Found ' + hoblis.length + ' hoblis');
      
      districtData.taluks.push({
        value: taluk.value,
        label: taluk.label,
        hoblis: hoblis.map(function(h) {
          return {
            value: h.value,
            label: h.label,
            villages: []
          };
        })
      });
      
      await wait(500);
    }
    
    allData.push(districtData);
    console.log('  Completed district: ' + district.label);
    
    await wait(1000);
  }
  
  console.log('Extraction complete!');
  console.log('Final Data:');
  const dataStr = JSON.stringify(allData, null, 2);
  console.log(dataStr);
  
  // Copy to clipboard
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(dataStr).then(function() {
      console.log('Data copied to clipboard!');
    }).catch(function() {
      console.log('Could not copy to clipboard. Please copy the JSON above manually.');
    });
  } else {
    console.log('Clipboard API not available. Please copy the JSON above manually.');
  }
  
  // Save to window for easy access
  window.extractedData = allData;
  console.log('Data also saved to window.extractedData');
  
  return allData;
})();

