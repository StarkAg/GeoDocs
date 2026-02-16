# Chrome Console Script - Fixed Version

## Instructions

1. Open Chrome and go to: `https://landrecords.karnataka.gov.in/service3/`
2. Press `F12` to open Developer Tools
3. Go to **Console** tab
4. **Copy the entire script below** (from the code block)
5. **Paste it into the console**
6. **Press Enter**
7. Wait 10-15 minutes for extraction to complete
8. Copy the JSON output when finished

## The Script (Copy Everything Below)

```javascript
(async function() {
  console.log('Starting data extraction...');
  
  const allData = [];
  
  const districtSelect = document.querySelector('select[name="ddl_district"]');
  const districts = Array.from(districtSelect.options)
    .filter(opt => opt.value !== '0' && opt.value !== 'All')
    .map(opt => ({
      value: opt.value,
      label: opt.text.trim()
    }));
  
  console.log('Found ' + districts.length + ' districts');
  
  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  
  const triggerChange = (element) => {
    const event = new Event('change', { bubbles: true });
    element.dispatchEvent(event);
  };
  
  for (let i = 0; i < districts.length; i++) {
    const district = districts[i];
    console.log('[' + (i + 1) + '/' + districts.length + '] Processing: ' + district.label);
    
    districtSelect.value = district.value;
    triggerChange(districtSelect);
    await wait(3000);
    
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
      
      talukSelect.value = taluk.value;
      triggerChange(talukSelect);
      await wait(3000);
      
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
  
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(dataStr).then(function() {
      console.log('Data copied to clipboard!');
    }).catch(function() {
      console.log('Could not copy to clipboard. Please copy the JSON above manually.');
    });
  } else {
    console.log('Clipboard API not available. Please copy the JSON above manually.');
  }
  
  window.extractedData = allData;
  console.log('Data also saved to window.extractedData');
  
  return allData;
})();
```

## Important Notes

- Make sure to copy the ENTIRE script including the `(async function() {` at the start and `})();` at the end
- Don't copy the markdown code block markers (the triple backticks)
- The script will take 10-15 minutes to complete
- You'll see progress messages in the console
- When done, copy the JSON output and save it to a file

