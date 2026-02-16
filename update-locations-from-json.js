const fs = require('fs');

// Read the filtered JSON data (hoblis without villages removed)
const jsonData = JSON.parse(fs.readFileSync('complete-karnataka-data-filtered.json', 'utf8'));

// Convert JSON to TypeScript format
function convertToTypeScript(data) {
  let tsCode = `/**
 * Static data for Karnataka districts, taluks, hoblis, and villages
 * This data is extracted from the Karnataka Land Records website
 * Updated: ${new Date().toLocaleString()}
 */

export interface LocationData {
  value: string;
  label: string;
  taluks?: LocationData[];
  hoblis?: LocationData[];
  villages?: LocationData[];
}

export const karnatakaDistricts: LocationData[] = [
`;

  data.forEach((district, districtIdx) => {
    const isLast = districtIdx === data.length - 1;
    
    tsCode += `  {\n`;
    tsCode += `    value: '${district.value}',\n`;
    tsCode += `    label: '${district.label.replace(/'/g, "\\'")}',\n`;
    
    if (district.taluks && district.taluks.length > 0) {
      tsCode += `    taluks: [\n`;
      
      district.taluks.forEach((taluk, talukIdx) => {
        const isLastTaluk = talukIdx === district.taluks.length - 1;
        
        tsCode += `      {\n`;
        tsCode += `        value: '${taluk.value}',\n`;
        tsCode += `        label: '${taluk.label.replace(/'/g, "\\'")}',\n`;
        
        if (taluk.hoblis && taluk.hoblis.length > 0) {
          tsCode += `        hoblis: [\n`;
          
          taluk.hoblis.forEach((hobli, hobliIdx) => {
            const isLastHobli = hobliIdx === taluk.hoblis.length - 1;
            
            tsCode += `          {\n`;
            tsCode += `            value: '${hobli.value}',\n`;
            tsCode += `            label: '${hobli.label.replace(/'/g, "\\'")}',\n`;
            
            if (hobli.villages && hobli.villages.length > 0) {
              tsCode += `            villages: [\n`;
              
              hobli.villages.forEach((village, villageIdx) => {
                const isLastVillage = villageIdx === hobli.villages.length - 1;
                tsCode += `              {value: '${village.value}', label: '${village.label.replace(/'/g, "\\'")}'}${isLastVillage ? '' : ','}\n`;
              });
              
              tsCode += `            ],\n`;
            }
            
            tsCode += `          }${isLastHobli ? '' : ','}\n`;
          });
          
          tsCode += `        ],\n`;
        }
        
        tsCode += `      }${isLastTaluk ? '' : ','}\n`;
      });
      
      tsCode += `    ],\n`;
    }
    
    tsCode += `  }${isLast ? '' : ','}\n`;
  });

  tsCode += `];

/**
 * Helper functions to get options
 */
export function getDistricts(): {value: string; label: string}[] {
  return karnatakaDistricts.map(dist => ({
    value: dist.value,
    label: dist.label,
  }));
}

export function getTaluks(districtValue: string): {value: string; label: string}[] {
  const district = karnatakaDistricts.find(d => d.value === districtValue);
  if (!district || !district.taluks) {
    return [];
  }
  return district.taluks.map(taluk => ({
    value: taluk.value,
    label: taluk.label,
  }));
}

export function getHoblis(
  districtValue: string,
  talukValue: string,
): {value: string; label: string}[] {
  const district = karnatakaDistricts.find(d => d.value === districtValue);
  if (!district || !district.taluks) {
    return [];
  }
  
  const taluk = district.taluks.find(t => t.value === talukValue);
  if (!taluk || !taluk.hoblis) {
    return [];
  }
  
  return taluk.hoblis.map(hobli => ({
    value: hobli.value,
    label: hobli.label,
  }));
}

export function getVillages(
  districtValue: string,
  talukValue: string,
  hobliValue: string,
): {value: string; label: string}[] {
  const district = karnatakaDistricts.find(d => d.value === districtValue);
  if (!district || !district.taluks) {
    return [];
  }
  
  const taluk = district.taluks.find(t => t.value === talukValue);
  if (!taluk || !taluk.hoblis) {
    return [];
  }
  
  const hobli = taluk.hoblis.find(h => h.value === hobliValue);
  if (!hobli || !hobli.villages) {
    return [];
  }
  
  return hobli.villages.map(village => ({
    value: village.value,
    label: village.label,
  }));
}
`;

  return tsCode;
}

// Generate TypeScript code
const tsCode = convertToTypeScript(jsonData);

// Write to file
fs.writeFileSync('src/data/karnatakaLocations.ts', tsCode, 'utf8');

console.log('✅ Updated karnatakaLocations.ts with data from complete-karnataka-data-filtered.json');
console.log(`📊 Contains ${jsonData.length} districts`);

const totalTaluks = jsonData.reduce((sum, d) => sum + (d.taluks || []).length, 0);
const totalHoblis = jsonData.reduce((sum, d) => sum + (d.taluks || []).reduce((s, t) => s + (t.hoblis || []).length, 0), 0);
const totalVillages = jsonData.reduce((sum, d) => sum + (d.taluks || []).reduce((s, t) => s + (t.hoblis || []).reduce((hSum, h) => hSum + (h.villages || []).length, 0), 0), 0);

console.log(`   ${totalTaluks} taluks`);
console.log(`   ${totalHoblis} hoblis`);
console.log(`   ${totalVillages} villages`);

