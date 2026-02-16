/**
 * Simple script to generate PDF from Karnataka locations data
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Read the data file
const dataFile = path.join(__dirname, 'src/data/karnatakaLocations.ts');
const dataContent = fs.readFileSync(dataFile, 'utf8');

// Simple regex-based extraction
function extractData(content) {
  const districts = [];
  const lines = content.split('\n');
  
  let currentDistrict = null;
  let currentTaluk = null;
  let inDistrict = false;
  let inTaluk = false;
  let inHobli = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // District
    if (line.match(/value:\s*'(\d+)',\s*label:\s*'([^']+)',\s*taluks:/)) {
      const match = line.match(/value:\s*'(\d+)',\s*label:\s*'([^']+)'/);
      if (match) {
        currentDistrict = {
          value: match[1],
          label: match[2],
          taluks: [],
        };
        districts.push(currentDistrict);
        inDistrict = true;
        inTaluk = false;
        inHobli = false;
      }
    }
    // Taluk
    else if (inDistrict && line.match(/value:\s*'(\d+)',\s*label:\s*'([^']+)',\s*hoblis:/)) {
      const match = line.match(/value:\s*'(\d+)',\s*label:\s*'([^']+)'/);
      if (match) {
        currentTaluk = {
          value: match[1],
          label: match[2],
          hoblis: [],
        };
        if (currentDistrict) {
          currentDistrict.taluks.push(currentTaluk);
        }
        inTaluk = true;
        inHobli = false;
      }
    }
    // Hobli
    else if (inTaluk && line.match(/value:\s*'(\d+)',\s*label:\s*'([^']+)'\}/)) {
      const match = line.match(/value:\s*'(\d+)',\s*label:\s*'([^']+)'/);
      if (match && currentTaluk) {
        currentTaluk.hoblis.push({
          value: match[1],
          label: match[2],
        });
      }
    }
    // Reset flags on closing braces
    else if (line === '},' || line === '}') {
      if (inHobli) {
        inHobli = false;
      } else if (inTaluk) {
        inTaluk = false;
        currentTaluk = null;
      } else if (inDistrict) {
        // Don't reset district until we see the end of taluks array
      }
    }
  }
  
  return districts;
}

// Extract data
const karnatakaDistricts = extractData(dataContent);

console.log(`Parsed ${karnatakaDistricts.length} districts`);

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

