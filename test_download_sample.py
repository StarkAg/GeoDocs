#!/usr/bin/env python3
"""
Test script to download a small sample of PDFs (first 5 villages)
Use this to verify the download script works before running the full download
"""

import json
import os
import sys

# Import functions from main script
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from download_all_pdfs import (
    setup_driver, get_pdf_url_from_page, download_pdf, 
    sanitize_filename, BASE_URL, DOWNLOAD_DIR
)

def test_download_sample():
    """Download first 5 villages as a test"""
    print("🧪 Testing PDF download with sample villages...")
    
    # Load data
    with open('complete-karnataka-data-filtered.json', 'r') as f:
        data = json.load(f)
    
    # Get first 5 villages
    sample_villages = []
    count = 0
    for district in data:
        for taluk in district.get('taluks', []):
            for hobli in taluk.get('hoblis', []):
                for village in hobli.get('villages', []):
                    sample_villages.append({
                        'district': district,
                        'taluk': taluk,
                        'hobli': hobli,
                        'village': village
                    })
                    count += 1
                    if count >= 5:
                        break
                if count >= 5:
                    break
            if count >= 5:
                break
        if count >= 5:
            break
    
    print(f"📋 Testing with {len(sample_villages)} villages:")
    for item in sample_villages:
        print(f"   - {item['district']['label']} > {item['taluk']['label']} > {item['hobli']['label']} > {item['village']['label']}")
    print()
    
    # Setup driver
    print("🌐 Setting up browser...")
    driver = setup_driver()
    
    success_count = 0
    failed_count = 0
    
    try:
        for idx, item in enumerate(sample_villages, 1):
            district = item['district']
            taluk = item['taluk']
            hobli = item['hobli']
            village = item['village']
            
            print(f"\n[{idx}/{len(sample_villages)}] Testing: {village['label']}")
            
            # Create filepath
            district_name = sanitize_filename(district['label'])
            taluk_name = sanitize_filename(taluk['label'])
            hobli_name = sanitize_filename(hobli['label'])
            village_name = sanitize_filename(village['label'])
            filepath = os.path.join(DOWNLOAD_DIR, district_name, taluk_name, hobli_name, f"{village_name}.pdf")
            
            # Get PDF URL
            print("   🔍 Getting PDF URL...")
            pdf_url = get_pdf_url_from_page(
                driver,
                district['value'],
                taluk['value'],
                hobli['value'],
                village['label']
            )
            
            if not pdf_url:
                print(f"   ❌ Failed to get PDF URL")
                failed_count += 1
                continue
            
            print(f"   ✅ PDF URL: {pdf_url[:80]}...")
            
            # Download PDF
            print("   ⬇️  Downloading PDF...")
            success = download_pdf(pdf_url, filepath)
            
            if success:
                print(f"   ✅ Successfully downloaded: {filepath}")
                success_count += 1
            else:
                print(f"   ❌ Download failed")
                failed_count += 1
    
    except KeyboardInterrupt:
        print("\n⚠️  Interrupted by user")
    finally:
        driver.quit()
        
        print("\n" + "="*60)
        print("📊 Test Results:")
        print(f"   ✅ Success: {success_count}/{len(sample_villages)}")
        print(f"   ❌ Failed: {failed_count}/{len(sample_villages)}")
        if success_count > 0:
            print(f"\n✨ Test passed! You can now run the full download script.")
            print(f"   Run: python3 download_all_pdfs.py")
        else:
            print(f"\n⚠️  Test failed. Please check the errors above.")
        print("="*60)

if __name__ == "__main__":
    test_download_sample()

