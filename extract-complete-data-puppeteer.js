const puppeteer = require('puppeteer');

async function extractAllData() {
  console.log('🚀 Starting browser...');
  const browser = await puppeteer.launch({
    headless: false, // Set to true if you don't want to see the browser
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  console.log('📄 Loading website...');
  await page.goto('https://landrecords.karnataka.gov.in/service3/', {
    waitUntil: 'networkidle2',
    timeout: 60000
  });
  
  // Wait for page to fully load
  await page.waitForTimeout(2000);
  
  // Extract districts
  const districts = await page.evaluate(() => {
    const select = document.querySelector('select[name="ddl_district"]');
    if (!select) return [];
    
    const options = Array.from(select.options);
    return options
      .filter(opt => opt.value !== '0' && opt.value !== 'All')
      .map(opt => ({
        value: opt.value,
        label: opt.text.trim()
      }));
  });
  
  console.log(`✅ Found ${districts.length} districts\n`);
  
  const allData = [];
  
  for (let i = 0; i < districts.length; i++) {
    const district = districts[i];
    console.log(`[${i + 1}/${districts.length}] Processing: ${district.label} (${district.value})`);
    
    // Select district
    await page.select('select[name="ddl_district"]', district.value);
    await page.waitForTimeout(2000); // Wait for taluks to load
    
    // Extract taluks
    const taluks = await page.evaluate(() => {
      const select = document.querySelector('select[name="ddl_taluk"]');
      if (!select) return [];
      
      const options = Array.from(select.options);
      return options
        .filter(opt => opt.value !== '0' && opt.value !== 'All' && opt.value !== '--Select--')
        .map(opt => ({
          value: opt.value,
          label: opt.text.trim()
        }));
    });
    
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
      await page.select('select[name="ddl_taluk"]', taluk.value);
      await page.waitForTimeout(2000); // Wait for hoblis to load
      
      // Extract hoblis
      const hoblis = await page.evaluate(() => {
        const select = document.querySelector('select[name="ddl_hobli"]');
        if (!select) return [];
        
        const options = Array.from(select.options);
        return options
          .filter(opt => opt.value !== '0' && opt.value !== 'All' && opt.value !== '--Select--')
          .map(opt => ({
            value: opt.value,
            label: opt.text.trim()
          }));
      });
      
      console.log(`      ✅ Found ${hoblis.length} hoblis`);
      
      districtData.taluks.push({
        value: taluk.value,
        label: taluk.label,
        hoblis: hoblis.map(h => ({
          value: h.value,
          label: h.label,
          villages: [] // Villages are text input, not dropdown
        }))
      });
      
      // Small delay to avoid overwhelming the server
      await page.waitForTimeout(500);
    }
    
    allData.push(districtData);
    console.log(`  ✅ Completed district: ${district.label}\n`);
    
    // Delay between districts
    await page.waitForTimeout(1000);
  }
  
  await browser.close();
  
  return allData;
}

// Run extraction
extractAllData()
  .then(data => {
    const fs = require('fs');
    fs.writeFileSync('complete-karnataka-data.json', JSON.stringify(data, null, 2));
    console.log('\n🎉 Data extraction complete!');
    console.log(`📊 Total districts: ${data.length}`);
    const totalTaluks = data.reduce((sum, d) => sum + d.taluks.length, 0);
    const totalHoblis = data.reduce((sum, d) => sum + d.taluks.reduce((s, t) => s + t.hoblis.length, 0), 0);
    console.log(`📊 Total taluks: ${totalTaluks}`);
    console.log(`📊 Total hoblis: ${totalHoblis}`);
    console.log('💾 Saved to complete-karnataka-data.json');
  })
  .catch(error => {
    console.error('❌ Error during extraction:', error);
    process.exit(1);
  });

