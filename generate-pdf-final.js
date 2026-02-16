/**
 * Script to generate PDF from Karnataka locations data
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Read the data file
const dataFile = path.join(__dirname, 'src/data/karnatakaLocations.ts');
const dataContent = fs.readFileSync(dataFile, 'utf8');

// Better parser using state machine
function parseDistricts(content) {
  const districts = [];
  const lines = content.split('\n');
  
  let currentDistrict = null;
  let currentTaluk = null;
  let depth = 0;
  let inTaluksArray = false;
  let inHoblisArray = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Track depth
    depth += (line.match(/\{/g) || []).length;
    depth -= (line.match(/\}/g) || []).length;
    
    // District start
    if (trimmed.match(/^\{\s*$/) && !currentDistrict) {
      currentDistrict = {value: '', label: '', taluks: []};
    }
    // District value
    else if (currentDistrict && !currentDistrict.value && trimmed.match(/value:\s*'(\d+)'/)) {
      const match = trimmed.match(/value:\s*'(\d+)'/);
      if (match) currentDistrict.value = match[1];
    }
    // District label
    else if (currentDistrict && !currentDistrict.label && trimmed.match(/label:\s*'([^']+)'/)) {
      const match = trimmed.match(/label:\s*'([^']+)'/);
      if (match) currentDistrict.label = match[1];
    }
    // Taluks array start
    else if (currentDistrict && trimmed.match(/taluks:\s*\[/)) {
      inTaluksArray = true;
    }
    // Taluk start
    else if (inTaluksArray && !inHoblisArray && trimmed.match(/^\{\s*$/)) {
      currentTaluk = {value: '', label: '', hoblis: []};
    }
    // Taluk value
    else if (currentTaluk && !currentTaluk.value && trimmed.match(/value:\s*'(\d+)'/)) {
      const match = trimmed.match(/value:\s*'(\d+)'/);
      if (match) currentTaluk.value = match[1];
    }
    // Taluk label
    else if (currentTaluk && !currentTaluk.label && trimmed.match(/label:\s*'([^']+)'/)) {
      const match = trimmed.match(/label:\s*'([^']+)'/);
      if (match) currentTaluk.label = match[1];
    }
    // Hoblis array start
    else if (currentTaluk && trimmed.match(/hoblis:\s*\[/)) {
      inHoblisArray = true;
    }
    // Hobli entry
    else if (inHoblisArray && trimmed.match(/value:\s*'(\d+)',\s*label:\s*'([^']+)'/)) {
      const match = trimmed.match(/value:\s*'(\d+)',\s*label:\s*'([^']+)'/);
      if (match && currentTaluk) {
        currentTaluk.hoblis.push({
          value: match[1],
          label: match[2],
        });
      }
    }
    // Hoblis array end
    else if (inHoblisArray && trimmed.match(/^\}\]/)) {
      inHoblisArray = false;
    }
    // Taluk end
    else if (currentTaluk && trimmed.match(/^\},?\s*$/) && !inHoblisArray) {
      if (currentDistrict && currentTaluk.value) {
        currentDistrict.taluks.push(currentTaluk);
      }
      currentTaluk = null;
    }
    // District end
    else if (currentDistrict && trimmed.match(/^\},?\s*$/) && !inTaluksArray) {
      if (currentDistrict.value) {
        districts.push(currentDistrict);
      }
      currentDistrict = null;
      inTaluksArray = false;
    }
  }
  
  return districts;
}

// Try a simpler approach - extract using regex patterns
function extractDataSimple(content) {
  const districts = [];
  
  // Find all district blocks
  const districtBlocks = content.match(/\{\s*value:\s*'(\d+)',\s*label:\s*'([^']+)',\s*taluks:\s*\[([\s\S]*?)\]\s*\}/g);
  
  if (districtBlocks) {
    districtBlocks.forEach((block, distIndex) => {
      const distMatch = block.match(/value:\s*'(\d+)',\s*label:\s*'([^']+)'/);
      if (!distMatch) return;
      
      const district = {
        value: distMatch[1],
        label: distMatch[2],
        taluks: [],
      };
      
      // Extract taluks from this block
      const talukBlocks = block.match(/\{\s*value:\s*'(\d+)',\s*label:\s*'([^']+)',\s*hoblis:\s*\[([\s\S]*?)\]\s*\}/g);
      
      if (talukBlocks) {
        talukBlocks.forEach((talukBlock) => {
          const talukMatch = talukBlock.match(/value:\s*'(\d+)',\s*label:\s*'([^']+)'/);
          if (!talukMatch) return;
          
          const taluk = {
            value: talukMatch[1],
            label: talukMatch[2],
            hoblis: [],
          };
          
          // Extract hoblis
          const hobliMatches = talukBlock.matchAll(/\{\s*value:\s*'(\d+)',\s*label:\s*'([^']+)'\}/g);
          for (const hobliMatch of hobliMatches) {
            taluk.hoblis.push({
              value: hobliMatch[1],
              label: hobliMatch[2],
            });
          }
          
          district.taluks.push(taluk);
        });
      }
      
      districts.push(district);
    });
  }
  
  return districts;
}

// Extract data
let karnatakaDistricts = extractDataSimple(dataContent);

if (karnatakaDistricts.length === 0) {
  console.log('Simple extraction failed, trying alternative...');
  karnatakaDistricts = parseDistricts(dataContent);
}

console.log(`Parsed ${karnatakaDistricts.length} districts`);

if (karnatakaDistricts.length === 0) {
  console.error('Could not parse any districts. Please check the data file.');
  process.exit(1);
}

// Create PDF
const doc = new PDFDocument({
  size: 'A4',
  margins: {top: 50, bottom: 50, left: 50, right: 50},
});

const outputPath = path.join(__dirname, 'Karnataka_Locations_Data.pdf');
const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

// Header
doc.fontSize(20).font('Helvetica-Bold').text('Karnataka Locations Data', {align: 'center'});
doc.moveDown();
doc.fontSize(10).font('Helvetica').text(`Generated on: ${new Date().toLocaleString()}`, {align: 'center'});
doc.moveDown(2);

// Process each district
karnatakaDistricts.forEach((district, distIndex) => {
  // Check page break
  if (doc.y > 700) {
    doc.addPage();
  }

  // District header
  doc.fontSize(14).font('Helvetica-Bold').fillColor('black');
  doc.text(`${distIndex + 1}. ${district.label}`, {continued: false});
  doc.moveDown(0.5);

  // Taluks
  if (district.taluks && district.taluks.length > 0) {
    district.taluks.forEach((taluk, talukIndex) => {
      if (doc.y > 700) {
        doc.addPage();
      }
      
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#333');
      doc.text(`   ${distIndex + 1}.${talukIndex + 1} ${taluk.label}`, {indent: 20});
      doc.moveDown(0.3);

      // Hoblis
      if (taluk.hoblis && taluk.hoblis.length > 0) {
        taluk.hoblis.forEach((hobli, hobliIndex) => {
          if (doc.y > 700) {
            doc.addPage();
          }
          
          doc.fontSize(9).font('Helvetica').fillColor('#666');
          doc.text(`      ${distIndex + 1}.${talukIndex + 1}.${hobliIndex + 1} ${hobli.label}`, {
            indent: 40,
          });
          doc.moveDown(0.2);
        });
      }
      
      doc.moveDown(0.3);
    });
  }

  doc.moveDown(0.5);
});

// Summary page
doc.addPage();
doc.fontSize(16).font('Helvetica-Bold').fillColor('black');
doc.text('Summary', {align: 'center'});
doc.moveDown();

const totalDistricts = karnatakaDistricts.length;
const totalTaluks = karnatakaDistricts.reduce(
  (sum, dist) => sum + (dist.taluks?.length || 0),
  0,
);
const totalHoblis = karnatakaDistricts.reduce(
  (sum, dist) =>
    sum +
    (dist.taluks?.reduce((tSum, taluk) => tSum + (taluk.hoblis?.length || 0), 0) || 0),
  0,
);

doc.fontSize(12).font('Helvetica');
doc.text(`Total Districts: ${totalDistricts}`);
doc.moveDown(0.5);
doc.text(`Total Taluks: ${totalTaluks}`);
doc.moveDown(0.5);
doc.text(`Total Hoblis: ${totalHoblis}`);
doc.moveDown(2);

// District-wise summary
doc.fontSize(14).font('Helvetica-Bold').text('District-wise Summary');
doc.moveDown();

karnatakaDistricts.forEach((district, index) => {
  if (doc.y > 700) {
    doc.addPage();
  }
  
  const talukCount = district.taluks?.length || 0;
  const hobliCount =
    district.taluks?.reduce((sum, taluk) => sum + (taluk.hoblis?.length || 0), 0) || 0;
  
  doc.fontSize(10).font('Helvetica');
  doc.text(`${index + 1}. ${district.label}: ${talukCount} Taluks, ${hobliCount} Hoblis`);
  doc.moveDown(0.3);
});

// Finalize
doc.end();

stream.on('finish', () => {
  console.log('✓ PDF generated successfully!');
  console.log(`✓ File saved at: ${outputPath}`);
  console.log(`\nSummary:`);
  console.log(`  - Districts: ${totalDistricts}`);
  console.log(`  - Taluks: ${totalTaluks}`);
  console.log(`  - Hoblis: ${totalHoblis}`);
});

stream.on('error', (err) => {
  console.error('Error generating PDF:', err);
});

