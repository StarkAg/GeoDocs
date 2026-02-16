#!/usr/bin/env python3
"""
Extract ALL data from the HTML table that's already on the page
The website has a table (grdMaps) with all districts, taluks, hoblis, and villages!
"""

import requests
from bs4 import BeautifulSoup
import json
from collections import defaultdict

def extract_all_data_from_table():
    """Extract all data from the grdMaps table in the HTML"""
    
    print("Fetching website HTML...")
    url = "https://landrecords.karnataka.gov.in/service3/"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    
    print("Parsing HTML and extracting table data...")
    soup = BeautifulSoup(response.content, 'html.parser')
    
    # Find the table with id="grdMaps"
    table = soup.find('table', {'id': 'grdMaps'})
    
    if not table:
        print("❌ Table not found!")
        return None
    
    print("✅ Found data table!")
    
    # Extract all rows (skip header)
    rows = table.find_all('tr')[1:]  # Skip header row
    
    print(f"Found {len(rows)} data rows")
    
    # Organize data by district -> taluk -> hobli -> villages
    data_structure = defaultdict(lambda: defaultdict(lambda: defaultdict(list)))
    district_map = {}  # Map district names to values
    
    # First, get district values from dropdown
    district_select = soup.find('select', {'name': 'ddl_district'})
    for option in district_select.find_all('option'):
        value = option.get('value', '')
        label = option.text.strip()
        if value and value not in ['0', 'All']:
            district_map[label] = value
    
    # Extract data from table rows
    for row in rows:
        cells = row.find_all('td')
        if len(cells) >= 4:
            district_name = cells[0].find('span').text.strip() if cells[0].find('span') else ''
            taluk_name = cells[1].find('span').text.strip() if cells[1].find('span') else ''
            hobli_name = cells[2].find('span').text.strip() if cells[2].find('span') else ''
            village_name = cells[3].find('span').text.strip() if cells[3].find('span') else ''
            
            if district_name and taluk_name and hobli_name and village_name:
                # Add village to structure
                if village_name not in data_structure[district_name][taluk_name][hobli_name]:
                    data_structure[district_name][taluk_name][hobli_name].append(village_name)
    
    # Convert to final structure
    all_data = []
    
    for district_name, taluks in sorted(data_structure.items()):
        district_value = district_map.get(district_name, '')
        
        district_data = {
            'value': district_value,
            'label': district_name,
            'taluks': []
        }
        
        for taluk_name, hoblis in sorted(taluks.items()):
            taluk_data = {
                'value': '',  # Will need to be filled from form submissions
                'label': taluk_name,
                'hoblis': []
            }
            
            for hobli_name, villages in sorted(hoblis.items()):
                hobli_data = {
                    'value': '',  # Will need to be filled from form submissions
                    'label': hobli_name,
                    'villages': [{'value': str(i+1), 'label': v} for i, v in enumerate(sorted(villages))]
                }
                
                taluk_data['hoblis'].append(hobli_data)
            
            district_data['taluks'].append(taluk_data)
        
        all_data.append(district_data)
    
    return all_data

if __name__ == "__main__":
    print("=" * 60)
    print("Extracting ALL Data from HTML Table")
    print("=" * 60)
    print()
    
    try:
        data = extract_all_data_from_table()
        
        if data:
            # Save to JSON
            output_file = "complete-karnataka-data-from-html.json"
            with open(output_file, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            print("\n" + "=" * 60)
            print("✅ Extraction Complete!")
            print("=" * 60)
            print(f"Total districts: {len(data)}")
            total_taluks = sum(len(d["taluks"]) for d in data)
            total_hoblis = sum(len(t["hoblis"]) for d in data for t in d["taluks"])
            total_villages = sum(len(h["villages"]) for d in data for t in d["taluks"] for h in t["hoblis"])
            print(f"Total taluks: {total_taluks}")
            print(f"Total hoblis: {total_hoblis}")
            print(f"Total villages: {total_villages}")
            print(f"\n💾 Data saved to: {output_file}")
            print("\n⚠️  Note: Taluk and Hobli 'value' fields are empty.")
            print("   They need to be filled by matching with dropdown values.")
        else:
            print("❌ Failed to extract data")
            
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()

