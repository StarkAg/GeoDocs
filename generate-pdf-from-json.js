const fs = require('fs');
const PDFDocument = require('pdfkit');

// Read the extracted JSON data
const data = JSON.parse(fs.readFileSync('complete-karnataka-data.json', 'utf8'));

// Create PDF
const doc = new PDFDocument({ margin: 50 });
doc.pipe(fs.createWriteStream('Karnataka_Complete_Locations.pdf'));

// Title page
doc.fontSize(24).text('Karnataka Land Records', { align: 'center' });
doc.fontSize(18).text('Complete Location Data', { align: 'center' });
doc.moveDown();
doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
doc.addPage();

// Summary
doc.fontSize(16).text('Summary', { underline: true });
doc.moveDown(0.5);
const totalDistricts = data.length;
const totalTaluks = data.reduce((sum, d) => sum + (d.taluks || []).length, 0);
const totalHoblis = data.reduce((sum, d) => sum + (d.taluks || []).reduce((s, t) => s + (t.hoblis || []).length, 0), 0);
const totalVillages = data.reduce((sum, d) => sum + (d.taluks || []).reduce((s, t) => s + (t.hoblis || []).reduce((hSum, h) => hSum + (h.villages || []).length, 0), 0), 0);

doc.fontSize(12);
doc.text(`Total Districts: ${totalDistricts}`);
doc.text(`Total Taluks: ${totalTaluks}`);
doc.text(`Total Hoblis: ${totalHoblis}`);
doc.text(`Total Villages: ${totalVillages}`);
doc.addPage();

// Helper function to build prefix string for tree structure
function buildPrefix(parentIsLastArray) {
  let prefix = '';
  for (let i = 0; i < parentIsLastArray.length; i++) {
    if (i === parentIsLastArray.length - 1) {
      // Last level - use connector
      prefix += parentIsLastArray[i] ? '    ' : '│   ';
    } else {
      // Intermediate levels
      prefix += parentIsLastArray[i] ? '    ' : '│   ';
    }
  }
  return prefix;
}

// Helper function to draw tree item
function drawTreeItem(doc, prefix, label, isLast, level) {
  const connector = isLast ? '└── ' : '├── ';
  const fullText = prefix + connector + label;
  
  // Set font size based on level
  const fontSize = level === 0 ? 14 : level === 1 ? 12 : level === 2 ? 10 : 8;
  doc.fontSize(fontSize);
  
  // Set color based on level
  const colors = {
    0: 'black',
    1: '#1a1a1a',
    2: '#333333',
    3: '#666666'
  };
  doc.fillColor(colors[level] || '#666666');
  
  doc.text(fullText);
  doc.moveDown(0.2);
}

// Process each district
data.forEach((district, districtIdx) => {
  // Check if we need a new page
  if (districtIdx > 0 && doc.y > 700) {
    doc.addPage();
  }
  
  // District (root level)
  const isLastDistrict = districtIdx === data.length - 1;
  drawTreeItem(doc, '', `${district.label} (Value: ${district.value})`, isLastDistrict, 0);
  
  if (!district.taluks || district.taluks.length === 0) {
    const prefix = buildPrefix([isLastDistrict]);
    doc.fontSize(9).fillColor('gray');
    doc.text(prefix + '└── No taluks available');
    doc.moveDown(0.3);
    return;
  }
  
  // Process taluks
  district.taluks.forEach((taluk, talukIdx) => {
    // Check if we need a new page
    if (doc.y > 750) {
      doc.addPage();
    }
    
    const isLastTaluk = talukIdx === district.taluks.length - 1;
    const prefix = buildPrefix([isLastDistrict]);
    drawTreeItem(doc, prefix, `${taluk.label} (Value: ${taluk.value})`, isLastTaluk, 1);
    
    if (!taluk.hoblis || taluk.hoblis.length === 0) {
      const hobliPrefix = buildPrefix([isLastDistrict, isLastTaluk]);
      doc.fontSize(9).fillColor('gray');
      doc.text(hobliPrefix + '└── No hoblis available');
      doc.moveDown(0.2);
      return;
    }
    
    // Process hoblis
    taluk.hoblis.forEach((hobli, hobliIdx) => {
      // Check if we need a new page
      if (doc.y > 750) {
        doc.addPage();
      }
      
      const isLastHobli = hobliIdx === taluk.hoblis.length - 1;
      const hobliPrefix = buildPrefix([isLastDistrict, isLastTaluk]);
      drawTreeItem(doc, hobliPrefix, `${hobli.label} (Value: ${hobli.value})`, isLastHobli, 2);
      
      if (!hobli.villages || hobli.villages.length === 0) {
        const villagePrefix = buildPrefix([isLastDistrict, isLastTaluk, isLastHobli]);
        doc.fontSize(8).fillColor('gray');
        doc.text(villagePrefix + '└── No villages available');
        doc.moveDown(0.15);
        return;
      }
      
      // Process villages
      hobli.villages.forEach((village, villageIdx) => {
        // Check if we need a new page
        if (doc.y > 750) {
          doc.addPage();
        }
        
        const isLastVillage = villageIdx === hobli.villages.length - 1;
        const villagePrefix = buildPrefix([isLastDistrict, isLastTaluk, isLastHobli]);
        
        drawTreeItem(doc, villagePrefix, village.label, isLastVillage, 3);
      });
    });
  });
  
  doc.moveDown(0.3);
});

// Finalize PDF
doc.end();

console.log('✅ PDF generated: Karnataka_Complete_Locations.pdf');
console.log(`📊 Contains ${totalDistricts} districts, ${totalTaluks} taluks, ${totalHoblis} hoblis, ${totalVillages} villages`);
