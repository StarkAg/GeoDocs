#!/usr/bin/env python3
"""
Download all village map PDFs from Karnataka Land Records website
This script will download ~18,323 PDFs organized by district/taluk/hobli
"""

import json
import os
import time
import requests
from datetime import datetime, timedelta
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import urllib.parse

# Configuration
BASE_URL = "https://landrecords.karnataka.gov.in/service3/"
DOWNLOAD_DIR = "village_maps"
PROGRESS_FILE = "download_progress.json"
PDF_LINKS_FILE = "all_pdf_links.json"  # File to store all PDF URLs
MAX_RETRIES = 3
DELAY_BETWEEN_REQUESTS = 1  # seconds between downloads (reduced for speed)
HEADLESS = False  # Set to False to see browser (popups work better in non-headless)

def setup_driver():
    """Setup Chrome driver with options"""
    chrome_options = Options()
    if HEADLESS:
        chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--window-size=1920,1080')
    
    # Set download preferences
    prefs = {
        "download.default_directory": os.path.abspath(DOWNLOAD_DIR),
        "download.prompt_for_download": False,
        "download.directory_upgrade": True,
        "plugins.always_open_pdf_externally": True
    }
    chrome_options.add_experimental_option("prefs", prefs)
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    return driver

def load_progress():
    """Load download progress from file"""
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE, 'r') as f:
            return json.load(f)
    return {"downloaded": [], "failed": []}

def save_progress(progress):
    """Save download progress to file"""
    with open(PROGRESS_FILE, 'w') as f:
        json.dump(progress, f, indent=2)

def load_pdf_links():
    """Load existing PDF links from file"""
    if os.path.exists(PDF_LINKS_FILE):
        with open(PDF_LINKS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

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

def save_pdf_links(pdf_links):
    """Save PDF links to file"""
    with open(PDF_LINKS_FILE, 'w', encoding='utf-8') as f:
        json.dump(pdf_links, f, indent=2, ensure_ascii=False)

def get_pdf_url_from_page(driver, district, taluk, hobli, village, debug=False):
    """Navigate to page, fill form, and extract PDF URL - using exact flow from test_website_flow.py"""
    try:
        if debug:
            print(f"      [DEBUG] Starting PDF URL extraction for {village}")
        # Navigate to the page
        driver.get(BASE_URL)
        time.sleep(1)  # Minimal wait
        
        # Fill district - EXACT from test script
        district_select = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.NAME, "ddl_district"))
        )
        driver.execute_script(f"arguments[0].value = '{district}';", district_select)
        driver.execute_script("arguments[0].dispatchEvent(new Event('change', {bubbles: true}));", district_select)
        time.sleep(0.5)  # Minimal wait - dropdowns are quick
        
        # Fill taluk
        taluk_select = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.NAME, "ddl_taluk"))
        )
        # Wait for taluk options to load - minimal wait
        time.sleep(0.5)  # Minimal wait
        options = taluk_select.find_elements(By.TAG_NAME, 'option')
        valid_options = [opt for opt in options if opt.get_attribute('value')]
        if len(valid_options) <= 1:
            return None  # No valid options
        driver.execute_script(f"arguments[0].value = '{taluk}';", taluk_select)
        driver.execute_script("arguments[0].dispatchEvent(new Event('change', {bubbles: true}));", taluk_select)
        time.sleep(0.5)  # Minimal wait - dropdowns are quick
        
        # Fill hobli
        hobli_select = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.NAME, "ddl_hobli"))
        )
        # Wait for hobli options to load - minimal wait
        time.sleep(0.5)  # Minimal wait
        options = hobli_select.find_elements(By.TAG_NAME, 'option')
        valid_options = [opt for opt in options if opt.get_attribute('value')]
        if len(valid_options) <= 1:
            return None  # No valid options
        driver.execute_script(f"arguments[0].value = '{hobli}';", hobli_select)
        time.sleep(0.3)  # Minimal wait
        
        # Fill village
        village_input = driver.find_element(By.NAME, "txtVlgName")
        village_input.clear()
        village_input.send_keys(village)
        driver.execute_script("arguments[0].dispatchEvent(new Event('input', {bubbles: true}));", village_input)
        driver.execute_script("arguments[0].dispatchEvent(new Event('change', {bubbles: true}));", village_input)
        time.sleep(0.3)  # Minimal wait
        
        # Click search button
        search_btn = driver.find_element(By.NAME, "btnSearch")
        search_btn.click()
        time.sleep(2)  # Minimal wait for results
        
        # Wait for grid to appear
        try:
            grid_table = WebDriverWait(driver, 15).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "table[id*='grdMaps'], table[id*='Grid']"))
            )
            # Minimal wait for grid to render
            time.sleep(1)
        except TimeoutException:
            return None
        
        # Now try to find PDF button - EXACT from test script
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
        
        # Get onclick attribute (might be empty if it opens popup)
        onclick = pdf_img.get_attribute('onclick') or ''
        
        # If onclick exists, try to extract URL from it first
        if onclick:
            import re
            # Pattern 1: FileDownload.aspx?file=... (most common)
            fileDownloadMatch = re.search(r"FileDownload\.aspx[^'\"\s]*file=([^'\")\s&]+)", onclick, re.IGNORECASE)
            if fileDownloadMatch:
                file_param = fileDownloadMatch.group(1).strip("'\"")
                pdf_url = f"{BASE_URL}FileDownload.aspx?file={file_param}"
                return pdf_url
            
            # Pattern 2: Try other patterns
            patterns = [
                r"FileDownload\.aspx\?file=['\"]([^'\"]+)['\"]",
                r"['\"]FileDownload\.aspx[^'\"]*file=([^'\")\s&]+)['\"]",
            ]
            
            for pattern in patterns:
                match = re.search(pattern, onclick, re.IGNORECASE)
                if match:
                    file_param = match.group(1).strip("'\"")
                    pdf_url = f"{BASE_URL}FileDownload.aspx?file={file_param}"
                    return pdf_url
        
        # If onclick is empty or extraction failed, click button and check for popup
        # This handles the case where button opens a popup window
        original_window = driver.current_window_handle
        window_handles_before = driver.window_handles  # Use list, not set (EXACT from test)
        
        # Click the PDF button
        try:
            driver.execute_script("arguments[0].click();", pdf_img)
            time.sleep(1)  # Minimal wait for popup
        except:
            pdf_img.click()
            time.sleep(1)  # Minimal wait for popup
        
        # Check for new window/popup - EXACT from test script
        window_handles_after = driver.window_handles
        new_windows = [w for w in window_handles_after if w not in window_handles_before]
        
        if new_windows:
            # Switch to popup - EXACT from test script
            driver.switch_to.window(new_windows[0])
            popup_url = driver.current_url
            
            # Extract PDF URL from popup - EXACT from test script
            if 'FileDownload.aspx' in popup_url:
                pdf_url = popup_url
                # Close popup and switch back - EXACT from test script
                driver.close()
                driver.switch_to.window(original_window)
                return pdf_url
            else:
                driver.close()
                driver.switch_to.window(original_window)
        else:
            # No popup, check current URL - EXACT from test script
            current_url = driver.current_url
            if 'FileDownload.aspx' in current_url:
                return current_url
        
        return None
            
    except Exception as e:
        return None
    
    return None

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
        return False

def sanitize_filename(name):
    """Sanitize filename to remove invalid characters"""
    invalid_chars = '<>:"/\\|?*'
    for char in invalid_chars:
        name = name.replace(char, '_')
    return name.strip()

def main():
    """Main function to download all PDFs"""
    print("🚀 Starting PDF download process...")
    print(f"📁 Download directory: {os.path.abspath(DOWNLOAD_DIR)}")
    
    # Load data
    print("📖 Loading location data...")
    with open('complete-karnataka-data-filtered.json', 'r') as f:
        data = json.load(f)
    
    # Load progress
    progress = load_progress()
    downloaded_set = set(progress.get("downloaded", []))
    failed_set = set(progress.get("failed", []))
    
    # Load PDF links
    pdf_links = load_pdf_links()
    
    # Count total villages
    total_villages = 0
    village_list = []
    for district in data:
        for taluk in district.get('taluks', []):
            for hobli in taluk.get('hoblis', []):
                for village in hobli.get('villages', []):
                    village_id = f"{district['value']}_{taluk['value']}_{hobli['value']}_{village['value']}"
                    if village_id not in downloaded_set and village_id not in failed_set:
                        village_list.append({
                            'id': village_id,
                            'district': district,
                            'taluk': taluk,
                            'hobli': hobli,
                            'village': village
                        })
                    total_villages += 1
    
    print(f"📊 Total villages: {total_villages}")
    print(f"✅ Already downloaded: {len(downloaded_set)}")
    print(f"❌ Previously failed: {len(failed_set)}")
    print(f"🔄 Remaining: {len(village_list)}")
    print()
    
    if not village_list:
        print("✨ All PDFs already downloaded!")
        return
    
    # Setup driver
    print("🌐 Setting up browser...")
    driver = setup_driver()
    
    downloaded_count = 0
    failed_count = 0
    start_time = time.time()
    
    # Progress tracking function
    def print_progress(current, total, downloaded, failed, start_t):
        """Print formatted progress information"""
        elapsed = time.time() - start_t
        progress_pct = (current / total) * 100
        
        # Calculate speed and ETA
        if current > 0 and elapsed > 0:
            avg_time_per_pdf = elapsed / current
            remaining = total - current
            eta_seconds = remaining * avg_time_per_pdf
            eta = timedelta(seconds=int(eta_seconds))
            speed_per_min = (current / elapsed) * 60
        else:
            avg_time_per_pdf = 0
            eta = timedelta(seconds=0)
            speed_per_min = 0
        
        # Progress bar (50 chars)
        bar_length = 50
        filled = int(bar_length * current / total)
        bar = '█' * filled + '░' * (bar_length - filled)
        
        # Format elapsed time
        elapsed_str = str(timedelta(seconds=int(elapsed))).split('.')[0]
        
        # Print progress line
        print(f"\r{' ' * 120}", end='')  # Clear line
        print(f"\r[{bar}] {progress_pct:5.1f}% | "
              f"✅ {downloaded:5d} | ❌ {failed:4d} | "
              f"⏱️  {speed_per_min:5.1f}/min | "
              f"⏳ ETA: {str(eta).split('.')[0]:>8} | "
              f"🕐 Elapsed: {elapsed_str:>8}", end='', flush=True)
    
    try:
        print("\n" + "="*80)
        print("🚀 Starting download process...")
        print("="*80 + "\n")
        
        for idx, item in enumerate(village_list, 1):
            village_id = item['id']
            district = item['district']
            taluk = item['taluk']
            hobli = item['hobli']
            village = item['village']
            
            # Create filepath
            district_name = sanitize_filename(district['label'])
            taluk_name = sanitize_filename(taluk['label'])
            hobli_name = sanitize_filename(hobli['label'])
            village_name = sanitize_filename(village['label'])
            filepath = os.path.join(DOWNLOAD_DIR, district_name, taluk_name, hobli_name, f"{village_name}.pdf")
            
            # Show current item (truncate if too long)
            current_item = f"{district_name} > {taluk_name} > {hobli_name} > {village_name}"
            if len(current_item) > 70:
                current_item = current_item[:67] + "..."
            
            # Print current item on new line every 10 items or first/last
            if idx == 1 or idx % 10 == 0 or idx == len(village_list):
                print(f"\n[{idx:5d}/{len(village_list)}] {current_item}")
            else:
                print(f"\n[{idx:5d}/{len(village_list)}] {current_item}")
            
            # Skip if already exists
            if os.path.exists(filepath):
                downloaded_set.add(village_id)
                downloaded_count += 1
                print_progress(idx, len(village_list), downloaded_count, failed_count, start_time)
                if idx % 10 == 0:
                    save_progress({"downloaded": list(downloaded_set), "failed": list(failed_set)})
                continue
            
            # Get PDF URL
            print("   🔍 Getting PDF URL...", end='', flush=True)
            pdf_url = None
            for retry in range(MAX_RETRIES):
                # Enable debug for first retry to see what's happening
                debug_mode = (retry == 0 and idx <= 3)  # Debug first 3 villages
                pdf_url = get_pdf_url_from_page(
                    driver,
                    district['value'],
                    taluk['value'],
                    hobli['value'],
                    village['label'],
                    debug=debug_mode
                )
                if pdf_url:
                    print(" ✅", end='', flush=True)
                    break
                if retry < MAX_RETRIES - 1:
                    print(f" 🔄 Retry {retry + 1}...", end='', flush=True)
                    time.sleep(2)
            
            if not pdf_url:
                print(" ❌ Failed")
                failed_set.add(village_id)
                failed_count += 1
                print_progress(idx, len(village_list), downloaded_count, failed_count, start_time)
                if idx % 10 == 0:
                    save_progress({"downloaded": list(downloaded_set), "failed": list(failed_set)})
                    save_pdf_links(pdf_links)
                continue
            
            # Save PDF link to JSON (even if download fails later)
            save_pdf_link(pdf_links, district, taluk, hobli, village, pdf_url)
            
            # Download PDF
            print(" ⬇️  Downloading...", end='', flush=True)
            success = False
            for retry in range(MAX_RETRIES):
                success = download_pdf(pdf_url, filepath)
                if success:
                    print(" ✅", end='', flush=True)
                    break
                if retry < MAX_RETRIES - 1:
                    print(f" 🔄 Retry {retry + 1}...", end='', flush=True)
                    time.sleep(2)
            
            if success:
                downloaded_set.add(village_id)
                downloaded_count += 1
            else:
                print(" ❌ Failed")
                failed_set.add(village_id)
                failed_count += 1
            
            # Update and show progress
            print_progress(idx, len(village_list), downloaded_count, failed_count, start_time)
            
            # Save progress and PDF links periodically
            if idx % 10 == 0:
                save_progress({"downloaded": list(downloaded_set), "failed": list(failed_set)})
                save_pdf_links(pdf_links)
            
            # Delay between requests
            if idx < len(village_list):
                time.sleep(DELAY_BETWEEN_REQUESTS)
    
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user. Saving progress...")
    finally:
        # Final save
        save_progress({"downloaded": list(downloaded_set), "failed": list(failed_set)})
        save_pdf_links(pdf_links)
        driver.quit()
        
        total_time = time.time() - start_time
        total_time_str = str(timedelta(seconds=int(total_time))).split('.')[0]
        
        print("\n\n" + "="*80)
        print("📊 Download Summary:")
        print("="*80)
        print(f"   ✅ Successfully downloaded: {downloaded_count}")
        print(f"   ❌ Failed: {failed_count}")
        print(f"   📁 Total in progress file: {len(downloaded_set)}")
        print(f"   ⏱️  Total time: {total_time_str}")
        if downloaded_count > 0:
            avg_time = total_time / downloaded_count
            print(f"   📈 Average time per PDF: {avg_time:.1f} seconds")
            speed_per_min = (downloaded_count / total_time) * 60 if total_time > 0 else 0
            print(f"   🚀 Average speed: {speed_per_min:.1f} PDFs/minute")
        print(f"   💾 Progress saved to: {PROGRESS_FILE}")
        print(f"   🔗 PDF links saved to: {PDF_LINKS_FILE}")
        print(f"   📊 Total PDF links collected: {sum(len(h) for d in pdf_links.values() for t in d.values() for h in t.values())}")
        print("="*80)

if __name__ == "__main__":
    main()

