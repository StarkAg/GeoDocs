#!/usr/bin/env python3
"""
Test script to debug the website flow and see what's happening
Uses data from complete-karnataka-data-filtered.json
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import time
import json
import os
import requests
from datetime import datetime

BASE_URL = "https://landrecords.karnataka.gov.in/service3/"
DOWNLOAD_DIR = "village_maps"
PDF_LINKS_FILE = "test_pdf_links.json"

def setup_driver():
    """Setup Chrome driver with options"""
    chrome_options = Options()
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--window-size=1920,1080')
    # Don't run headless so we can see what's happening
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    return driver

def sanitize_filename(name):
    """Sanitize filename to remove invalid characters"""
    invalid_chars = '<>:"/\\|?*'
    for char in invalid_chars:
        name = name.replace(char, '_')
    return name.strip()

def download_pdf(pdf_url, filepath):
    """Download PDF from URL"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': BASE_URL
        }
        response = requests.get(pdf_url, headers=headers, timeout=30, stream=True)
        response.raise_for_status()
        
        # Check if it's actually a PDF
        if 'application/pdf' in response.headers.get('content-type', ''):
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            with open(filepath, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            return True
        else:
            return False
    except Exception as e:
        print(f"      ❌ Download error: {e}")
        return False

def save_pdf_link(pdf_links, district, taluk, hobli, village, pdf_url):
    """Save a PDF link to the JSON structure"""
    district_name = district['label']
    taluk_name = taluk['label']
    hobli_name = hobli['label']
    village_name = village['label']
    
    # Initialize structure if needed
    if district_name not in pdf_links:
        pdf_links[district_name] = {}
    if taluk_name not in pdf_links[district_name]:
        pdf_links[district_name][taluk_name] = {}
    if hobli_name not in pdf_links[district_name][taluk_name]:
        pdf_links[district_name][taluk_name][hobli_name] = {}
    
    # Save the link
    pdf_links[district_name][taluk_name][hobli_name][village_name] = {
        'url': pdf_url,
        'district_value': district['value'],
        'taluk_value': taluk['value'],
        'hobli_value': hobli['value'],
        'village_value': village['value'],
        'timestamp': datetime.now().isoformat()
    }

def load_pdf_links():
    """Load existing PDF links from file"""
    if os.path.exists(PDF_LINKS_FILE):
        with open(PDF_LINKS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

def save_pdf_links(pdf_links):
    """Save PDF links to file"""
    with open(PDF_LINKS_FILE, 'w', encoding='utf-8') as f:
        json.dump(pdf_links, f, indent=2, ensure_ascii=False)

def get_pdf_url_from_page(driver, district_value, taluk_value, hobli_value, village_label):
    """Get PDF URL from page - same logic as download script"""
    try:
        # Navigate to the page
        driver.get(BASE_URL)
        time.sleep(1)
        
        # Fill district
        district_select = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.NAME, "ddl_district"))
        )
        driver.execute_script(f"arguments[0].value = '{district_value}';", district_select)
        driver.execute_script("arguments[0].dispatchEvent(new Event('change', {bubbles: true}));", district_select)
        time.sleep(0.5)
        
        # Fill taluk
        taluk_select = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.NAME, "ddl_taluk"))
        )
        time.sleep(0.5)
        options = taluk_select.find_elements(By.TAG_NAME, 'option')
        valid_options = [opt for opt in options if opt.get_attribute('value')]
        if len(valid_options) <= 1:
            return None
        driver.execute_script(f"arguments[0].value = '{taluk_value}';", taluk_select)
        driver.execute_script("arguments[0].dispatchEvent(new Event('change', {bubbles: true}));", taluk_select)
        time.sleep(0.5)
        
        # Fill hobli
        hobli_select = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.NAME, "ddl_hobli"))
        )
        time.sleep(0.5)
        options = hobli_select.find_elements(By.TAG_NAME, 'option')
        valid_options = [opt for opt in options if opt.get_attribute('value')]
        if len(valid_options) <= 1:
            return None
        driver.execute_script(f"arguments[0].value = '{hobli_value}';", hobli_select)
        time.sleep(0.3)
        
        # Fill village
        village_input = driver.find_element(By.NAME, "txtVlgName")
        village_input.clear()
        village_input.send_keys(village_label)
        driver.execute_script("arguments[0].dispatchEvent(new Event('input', {bubbles: true}));", village_input)
        driver.execute_script("arguments[0].dispatchEvent(new Event('change', {bubbles: true}));", village_input)
        time.sleep(0.3)
        
        # Click search
        search_btn = driver.find_element(By.NAME, "btnSearch")
        search_btn.click()
        time.sleep(2)
        
        # Wait for grid
        try:
            grid_table = WebDriverWait(driver, 15).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "table[id*='grdMaps'], table[id*='Grid']"))
            )
            time.sleep(1)
        except TimeoutException:
            return None
        
        # Find PDF button
        pdf_img = None
        try:
            pdf_img = driver.find_element(By.ID, "grdMaps_ImgPdf_0")
        except NoSuchElementException:
            try:
                pdf_img = driver.find_element(By.CSS_SELECTOR, "img[id*='grdMaps_ImgPdf']")
            except NoSuchElementException:
                try:
                    pdf_img = grid_table.find_element(By.CSS_SELECTOR, "img[id*='ImgPdf']")
                except NoSuchElementException:
                    return None
        
        if not pdf_img:
            return None
        
        # Get onclick
        onclick = pdf_img.get_attribute('onclick') or ''
        
        # Try to extract from onclick first
        if onclick:
            import re
            fileDownloadMatch = re.search(r"FileDownload\.aspx[^'\"\s]*file=([^'\")\s&]+)", onclick, re.IGNORECASE)
            if fileDownloadMatch:
                file_param = fileDownloadMatch.group(1).strip("'\"")
                pdf_url = f"{BASE_URL}FileDownload.aspx?file={file_param}"
                return pdf_url
        
        # Click button and check for popup
        original_window = driver.current_window_handle
        window_handles_before = driver.window_handles
        
        try:
            driver.execute_script("arguments[0].click();", pdf_img)
            time.sleep(1)
        except:
            pdf_img.click()
            time.sleep(1)
        
        window_handles_after = driver.window_handles
        new_windows = [w for w in window_handles_after if w not in window_handles_before]
        
        if new_windows:
            driver.switch_to.window(new_windows[0])
            popup_url = driver.current_url
            if 'FileDownload.aspx' in popup_url:
                driver.close()
                driver.switch_to.window(original_window)
                return popup_url
            driver.close()
            driver.switch_to.window(original_window)
        else:
            current_url = driver.current_url
            if 'FileDownload.aspx' in current_url:
                return current_url
        
        return None
    except Exception as e:
        return None

def test_website_flow():
    """Test the website flow with 5 villages, store URLs and download PDFs"""
    
    # Load data from filtered JSON
    print("📖 Loading data from complete-karnataka-data-filtered.json...")
    try:
        with open('complete-karnataka-data-filtered.json', 'r') as f:
            data = json.load(f)
        
        # Get first 5 villages
        villages_to_test = []
        count = 0
        for district in data:
            for taluk in district.get('taluks', []):
                for hobli in taluk.get('hoblis', []):
                    for village in hobli.get('villages', []):
                        villages_to_test.append({
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
        
        print(f"   ✅ Testing {len(villages_to_test)} villages:")
        for i, item in enumerate(villages_to_test, 1):
            print(f"      {i}. {item['district']['label']} > {item['taluk']['label']} > {item['hobli']['label']} > {item['village']['label']}")
        print()
    except Exception as e:
        print(f"   ❌ Error loading JSON: {e}")
        return
    
    # Load PDF links
    pdf_links = load_pdf_links()
    
    print("🌐 Setting up browser...")
    driver = setup_driver()
    
    success_count = 0
    failed_count = 0
    
    try:
        for idx, item in enumerate(villages_to_test, 1):
            district = item['district']
            taluk = item['taluk']
            hobli = item['hobli']
            village = item['village']
            
            print(f"\n{'='*60}")
            print(f"[{idx}/5] Testing: {district['label']} > {taluk['label']} > {hobli['label']} > {village['label']}")
            print(f"{'='*60}")
            
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
            
            # Save PDF link
            save_pdf_link(pdf_links, district, taluk, hobli, village, pdf_url)
            save_pdf_links(pdf_links)
            print(f"   💾 URL saved to {PDF_LINKS_FILE}")
            
            # Download PDF to correct folder
            district_name = sanitize_filename(district['label'])
            taluk_name = sanitize_filename(taluk['label'])
            hobli_name = sanitize_filename(hobli['label'])
            village_name = sanitize_filename(village['label'])
            filepath = os.path.join(DOWNLOAD_DIR, district_name, taluk_name, hobli_name, f"{village_name}.pdf")
            
            print(f"   ⬇️  Downloading PDF to: {filepath}")
            success = download_pdf(pdf_url, filepath)
            
            if success:
                print(f"   ✅ PDF downloaded successfully!")
                success_count += 1
            else:
                print(f"   ❌ PDF download failed")
                failed_count += 1
        
        print("\n" + "="*60)
        print("📊 Test Summary:")
        print("="*60)
        print(f"   ✅ Successfully processed: {success_count}/5")
        print(f"   ❌ Failed: {failed_count}/5")
        print(f"   💾 PDF links saved to: {PDF_LINKS_FILE}")
        print(f"   📁 PDFs saved to: {DOWNLOAD_DIR}/")
        print("="*60)
        
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        driver.quit()

if __name__ == "__main__":
    test_website_flow()

