/**
 * Complete PDF generator for Karnataka locations data
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Read the data file
const dataFile = path.join(__dirname, 'src/data/karnatakaLocations.ts');
const dataContent = fs.readFileSync(dataFile, 'utf8');

// Improved parser that handles nested structures
function parseCompleteData(content) {
  const districts = [];
  
  // Split by district blocks more carefully
  // Each district starts with { value: 'X', label: 'Y', taluks: [
  const districtRegex = /\{\s*value:\s*'(\d+)',\s*label:\s*'([^']+)',\s*taluks:\s*\[/g;
  let districtMatch;
  let lastIndex = 0;
  
  while ((districtMatch = districtRegex.exec(content)) !== null) {
    const district = {
      value: districtMatch[1],
      label: districtMatch[2],
      taluks: [],
    };
    
    // Find the matching closing bracket for this district
    let bracketCount = 1;
    let startPos = districtMatch.index + districtMatch[0].length;
    let endPos = startPos;
    
    // Find the end of this district's taluks array
    while (bracketCount > 0 && endPos < content.length) {
      if (content[endPos] === '[') bracketCount++;
      if (content[endPos] === ']') bracketCount--;
      endPos++;
    }
    
    const talukSection = content.substring(startPos, endPos - 1);
    
    // Parse taluks from this section
    const talukRegex = /\{\s*value:\s*'(\d+)',\s*label:\s*'([^']+)',\s*hoblis:\s*\[/g;
    let talukMatch;
    
    while ((talukMatch = talukRegex.exec(talukSection)) !== null) {
      const taluk = {
        value: talukMatch[1],
        label: talukMatch[2],
        hoblis: [],
      };
      
      // Find hoblis for this taluk
      let hobliBracketCount = 1;
      let hobliStart = talukMatch.index + talukMatch[0].length;
      let hobliEnd = hobliStart;
      const talukSubSection = talukSection.substring(talukMatch.index);
      
      while (hobliBracketCount > 0 && hobliEnd < talukSubSection.length) {
        if (talukSubSection[hobliEnd] === '[') hobliBracketCount++;
        if (talukSubSection[hobliEnd] === ']') hobliBracketCount--;
        hobliEnd++;
      }
      
      const hobliSection = talukSubSection.substring(talukMatch[0].length, hobliEnd - 1);
      
      // Extract all hobli entries
      const hobliRegex = /\{\s*value:\s*'(\d+)',\s*label:\s*'([^']+)'\}/g;
      let hobliMatch;
      
      while ((hobliMatch = hobliRegex.exec(hobliSection)) !== null) {
        taluk.hoblis.push({
          value: hobliMatch[1],
          label: hobliMatch[2],
        });
      }
      
      district.taluks.push(taluk);
    }
    
    districts.push(district);
  }
  
  return districts;
}

// Parse the data
const karnatakaDistricts = parseCompleteData(dataContent);

console.log(`Parsed ${karnatakaDistricts.length} districts`);

if (karnatakaDistricts.length === 0) {
  console.error('Could not parse any districts.');
  process.exit(1);
}

// Calculate totals
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

console.log(`Total: ${totalDistricts} Districts, ${totalTaluks} Taluks, ${totalHoblis} Hoblis`);

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
doc.moveDown();
doc.fontSize(9).font('Helvetica').fillColor('#666').text(
  `Total: ${totalDistricts} Districts | ${totalTaluks} Taluks | ${totalHoblis} Hoblis`,
  {align: 'center'}
);
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
  console.log('\n✓ PDF generated successfully!');
  console.log(`✓ File saved at: ${outputPath}`);
  console.log(`\nFile size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
});

stream.on('error', (err) => {
  console.error('Error generating PDF:', err);
});

