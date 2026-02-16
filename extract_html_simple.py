#!/usr/bin/env python3
"""
Simple script to extract HTML from the website and parse all data
"""

import requests
from bs4 import BeautifulSoup
import json

def extract_all_data_from_html():
    """Extract all data from the website HTML"""
    
    print("Fetching website HTML...")
    url = "https://landrecords.karnataka.gov.in/service3/"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    
    print("Parsing HTML...")
    soup = BeautifulSoup(response.content, 'html.parser')
    
    # Save raw HTML
    with open('website-html.html', 'w', encoding='utf-8') as f:
        f.write(response.text)
    print("✅ Saved raw HTML to website-html.html")
    
    # Extract districts
    district_select = soup.find('select', {'name': 'ddl_district'})
    districts = []
    
    if district_select:
        for option in district_select.find_all('option'):
            value = option.get('value', '')
            label = option.text.strip()
            if value and value not in ['0', 'All']:
                districts.append({
                    'value': value,
                    'label': label
                })
    
    print(f"Found {len(districts)} districts in HTML")
    
    # The HTML might have all the data embedded, let's check for any data structures
    # Look for script tags with data
    scripts = soup.find_all('script')
    data_found = False
    
    for script in scripts:
        if script.string:
            # Look for JSON data or arrays in scripts
            content = script.string
            if 'district' in content.lower() or 'taluk' in content.lower():
                print("Found potential data in script tags")
                # Save script content for inspection
                with open('scripts-content.txt', 'w', encoding='utf-8') as f:
                    f.write(content)
                data_found = True
    
    # Also check for hidden inputs or data attributes
    hidden_inputs = soup.find_all('input', type='hidden')
    print(f"Found {len(hidden_inputs)} hidden inputs")
    
    # Look for any tables with data
    tables = soup.find_all('table')
    print(f"Found {len(tables)} tables in HTML")
    
    # Save districts data
    output = {
        'districts': districts,
        'note': 'This is initial HTML data. Full data may require form submissions to get taluks/hoblis/villages'
    }
    
    with open('html-extracted-data.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Extracted {len(districts)} districts")
    print("✅ Saved HTML to website-html.html")
    print("✅ Saved extracted data to html-extracted-data.json")
    print("\nNote: Full data (taluks, hoblis, villages) requires form submissions.")
    print("The HTML contains the initial page structure only.")
    
    return output

if __name__ == "__main__":
    try:
        extract_all_data_from_html()
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

