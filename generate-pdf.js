/**
 * Script to generate PDF from Karnataka locations data
 * Run with: node generate-pdf.js
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Read the data file
const dataFile = path.join(__dirname, 'src/data/karnatakaLocations.ts');
const dataContent = fs.readFileSync(dataFile, 'utf8');

// Parse the nested structure manually
function parseDistricts(content) {
  const districts = [];
  let i = 0;
  
  // Find all district blocks
  const districtPattern = /\{\s*value:\s*'(\d+)',\s*label:\s*'([^']+)',\s*taluks:\s*\[/g;
  let match;
  
  while ((match = districtPattern.exec(content)) !== null) {
    const district = {
      value: match[1],
      label: match[2],
      taluks: [],
    };
    
    // Find the matching closing bracket for this district's taluks array
    let bracketCount = 1;
    let talukStart = match.index + match[0].length;
    let talukEnd = talukStart;
    
    while (bracketCount > 0 && talukEnd < content.length) {
      if (content[talukEnd] === '[') bracketCount++;
      if (content[talukEnd] === ']') bracketCount--;
      talukEnd++;
    }
    
    const talukContent = content.substring(talukStart, talukEnd - 1);
    
    // Parse taluks
    const talukPattern = /\{\s*value:\s*'(\d+)',\s*label:\s*'([^']+)',\s*hoblis:\s*\[/g;
    let talukMatch;
    
    while ((talukMatch = talukPattern.exec(talukContent)) !== null) {
      const taluk = {
        value: talukMatch[1],
        label: talukMatch[2],
        hoblis: [],
      };
      
      // Find hoblis for this taluk
      let hobliBracketCount = 1;
      let hobliStart = talukMatch.index + talukMatch[0].length;
      let hobliEnd = hobliStart;
      const talukSubContent = talukContent.substring(talukMatch.index);
      
      while (hobliBracketCount > 0 && hobliEnd < talukSubContent.length) {
        if (talukSubContent[hobliEnd] === '[') hobliBracketCount++;
        if (talukSubContent[hobliEnd] === ']') hobliBracketCount--;
        hobliEnd++;
      }
      
      const hobliContent = talukSubContent.substring(talukMatch[0].length, hobliEnd - 1);
      
      // Parse hoblis
      const hobliPattern = /\{\s*value:\s*'(\d+)',\s*label:\s*'([^']+)'\}/g;
      let hobliMatch;
      
      while ((hobliMatch = hobliPattern.exec(hobliContent)) !== null) {
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
const karnatakaDistricts = parseDistricts(dataContent);

if (karnatakaDistricts.length === 0) {
  console.error('Could not parse districts. Using fallback method...');
  // Fallback: Create a simple structure
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

let yPosition = doc.y;
const pageHeight = 750;
const margin = 50;

// Function to add new page if needed
function checkPageBreak(requiredSpace) {
  if (yPosition + requiredSpace > pageHeight - margin) {
    doc.addPage();
    yPosition = margin;
    return true;
  }
  return false;
}

// Process each district
karnatakaDistricts.forEach((district, distIndex) => {
  // Check if we need a new page
  const estimatedSpace = 50 + (district.taluks?.length || 0) * 30;
  if (checkPageBreak(estimatedSpace)) {
    yPosition = margin;
  }

  // District header
  doc.fontSize(14).font('Helvetica-Bold').fillColor('black');
  doc.text(`${distIndex + 1}. ${district.label}`, {continued: false});
  doc.moveDown(0.5);
  yPosition = doc.y;

  // Taluks
  if (district.taluks && district.taluks.length > 0) {
    district.taluks.forEach((taluk, talukIndex) => {
      checkPageBreak(25);
      
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#333');
      doc.text(`   ${distIndex + 1}.${talukIndex + 1} ${taluk.label}`, {indent: 20});
      doc.moveDown(0.3);
      yPosition = doc.y;

      // Hoblis
      if (taluk.hoblis && taluk.hoblis.length > 0) {
        taluk.hoblis.forEach((hobli, hobliIndex) => {
          checkPageBreak(15);
          
          doc.fontSize(9).font('Helvetica').fillColor('#666');
          doc.text(`      ${distIndex + 1}.${talukIndex + 1}.${hobliIndex + 1} ${hobli.label}`, {
            indent: 40,
          });
          doc.moveDown(0.2);
          yPosition = doc.y;
        });
      }
      
      doc.moveDown(0.3);
      yPosition = doc.y;
    });
  }

  doc.moveDown(0.5);
  yPosition = doc.y;
});

// Footer on each page
let pageCount = 0;
doc.on('pageAdded', () => {
  pageCount++;
  doc.fontSize(8).font('Helvetica').fillColor('#999');
  doc.text(
    `Page ${pageCount} - Karnataka Locations Data`,
    doc.page.width / 2,
    doc.page.height - 30,
    {align: 'center'},
  );
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
