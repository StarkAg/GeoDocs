#!/usr/bin/env python3
"""
Extract data from saved HTML file - MUCH FASTER!
This parses the saved HTML file instead of scraping the live website
"""

from bs4 import BeautifulSoup
import json
import re

def extract_data_from_html(html_file):
    """Extract all districts, taluks, hoblis from saved HTML"""
    
    print(f"Reading HTML file: {html_file}")
    with open(html_file, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    soup = BeautifulSoup(html_content, 'html.parser')
    
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
                    'label': label,
                    'taluks': []
                })
    
    print(f"Found {len(districts)} districts")
    
    # The HTML file might have JavaScript that populates taluks/hoblis
    # Or it might have data embedded in script tags
    # Let's check for embedded data or JavaScript arrays
    
    # Look for JavaScript variables or data structures
    scripts = soup.find_all('script')
    data_found = False
    
    for script in scripts:
        if script.string:
            script_content = script.string
            
            # Look for district/taluk/hobli data in JavaScript
            # This is a fallback - the HTML might not have all data
            
            # Try to find any data structures
            if 'district' in script_content.lower() or 'taluk' in script_content.lower():
                print("Found potential data in JavaScript...")
                # Could parse JavaScript here if needed
    
    # Since the saved HTML likely only has the initial page state,
    # we'll need to note that taluks/hoblis need to be fetched dynamically
    # But we can at least get the district structure
    
    print("\nNote: Saved HTML typically only contains initial page state.")
    print("Taluks and hoblis are loaded dynamically via JavaScript.")
    print("We'll structure the data with placeholders for now.")
    
    # Return structure with districts (taluks/hoblis will be empty - need dynamic loading)
    return districts

def create_complete_structure():
    """Create a complete data structure template"""
    
    # Since we can't get all data from static HTML, we'll create a structure
    # that matches what we know from the website
    
    print("\nCreating data structure from known website values...")
    
    # Known district values from website
    districts_data = [
        {"value": "2", "label": "Bagalkote"},
        {"value": "21", "label": "Bangalore Rural"},
        {"value": "20", "label": "BANGALORE URBAN"},
        {"value": "1", "label": "Belgaum"},
        {"value": "12", "label": "BELLARY"},
        {"value": "5", "label": "Bidar"},
        {"value": "3", "label": "Bijapur"},
        {"value": "27", "label": "Chamarajanagara"},
        {"value": "28", "label": "Chikkaballapur"},
        {"value": "17", "label": "Chikmagalur"},
        {"value": "13", "label": "chitradurga"},
        {"value": "24", "label": "Dakshina Kannada"},
        {"value": "14", "label": "Davanagere"},
        {"value": "9", "label": "DHARWAD"},
        {"value": "8", "label": "Gadag"},
        {"value": "4", "label": "Gulbarga"},
        {"value": "23", "label": "Hassan"},
        {"value": "11", "label": "Haveri"},
        {"value": "25", "label": "Kodagu"},
        {"value": "19", "label": "KOLAR"},
        {"value": "7", "label": "koppal"},
        {"value": "22", "label": "mandya"},
        {"value": "26", "label": "Mysore"},
        {"value": "6", "label": "Raichur"},
        {"value": "29", "label": "Ramanagara"},
        {"value": "15", "label": "Shimoga"},
        {"value": "18", "label": "Tumkur"},
        {"value": "16", "label": "UDUPI"},
        {"value": "10", "label": "Uttar Kannada"},
        {"value": "30", "label": "Yadagir"}
    ]
    
    result = []
    for district in districts_data:
        result.append({
            "value": district["value"],
            "label": district["label"],
            "taluks": []  # Will be populated by dynamic extraction
        })
    
    return result

if __name__ == "__main__":
    html_file = "SSLR _ Revenue Maps Online.html"
    
    print("=" * 60)
    print("Extracting Data from Saved HTML File")
    print("=" * 60)
    print()
    
    try:
        # Try to extract from HTML
        districts = extract_data_from_html(html_file)
        
        # If we got districts, use them; otherwise create structure
        if not districts or len(districts) == 0:
            print("\nNo districts found in HTML, creating structure from known values...")
            districts = create_complete_structure()
        
        # Save what we have
        output_file = "districts-from-html.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(districts, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ Extracted {len(districts)} districts")
        print(f"💾 Saved to: {output_file}")
        print("\n⚠️  Note: Taluks and hoblis need to be extracted dynamically")
        print("   Use extract_data.py to get complete data from live website")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()

