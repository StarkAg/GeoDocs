#!/usr/bin/env python3
"""
Extract complete data from Karnataka Land Records website
This script will:
1. Go through all districts
2. For each district, get all taluks
3. For each taluk, get all hoblis
4. For each hobli, get all villages from the table
"""

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
import json
import time
from datetime import datetime

try:
    from webdriver_manager.chrome import ChromeDriverManager
    USE_WEBDRIVER_MANAGER = True
except ImportError:
    USE_WEBDRIVER_MANAGER = False
    print("Note: webdriver-manager not installed. Make sure ChromeDriver is in PATH.")

def setup_driver():
    """Setup Chrome driver"""
    options = webdriver.ChromeOptions()
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--disable-blink-features=AutomationControlled')
    # Run headless (no browser window) - faster and cleaner
    options.add_argument('--headless')
    options.add_argument('--disable-gpu')
    options.add_argument('--window-size=1920,1080')
    
    if USE_WEBDRIVER_MANAGER:
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=options)
    else:
        driver = webdriver.Chrome(options=options)
    
    driver.implicitly_wait(2)  # Ultra-fast implicit wait
    return driver

def get_villages_from_table(driver):
    """Extract village names from the table, handling pagination"""
    all_villages = []
    
    try:
        # First, check if there's pagination and get total pages
        pagination_info = driver.execute_script("""
            var totalPages = 1;
            
            // Method 1: Look for "Page X of Y" text
            var allText = document.body.textContent || document.body.innerText;
            var pageMatch = allText.match(/Page\s+(\d+)\s+of\s+(\d+)/i);
            if (pageMatch) {
                totalPages = parseInt(pageMatch[2]);
                return {totalPages: totalPages, method: 'text'};
            }
            
            // Method 2: Look for pagination links with page numbers
            var pageLinks = document.querySelectorAll('a[href*="Page"], a[onclick*="Page"], a[href*="__doPostBack"]');
            var pageNumbers = new Set();
            for (var i = 0; i < pageLinks.length; i++) {
                var link = pageLinks[i];
                var text = link.textContent.trim();
                var num = parseInt(text);
                if (!isNaN(num) && num > 0) {
                    pageNumbers.add(num);
                }
                // Also check href/onclick for page numbers
                var href = link.getAttribute('href') || link.getAttribute('onclick') || '';
                var hrefMatch = href.match(/Page[\\$]?(\\d+)/i);
                if (hrefMatch) {
                    pageNumbers.add(parseInt(hrefMatch[1]));
                }
            }
            if (pageNumbers.size > 0) {
                totalPages = Math.max.apply(null, Array.from(pageNumbers));
                return {totalPages: totalPages, method: 'links'};
            }
            
            // Method 3: Look for GridView pagination (ASP.NET)
            var gridView = document.querySelector('[id*="grd"], [id*="Grid"], table[id*="gv"]');
            if (gridView) {
                var paginationRow = gridView.querySelector('tr:last-child, tfoot tr');
                if (paginationRow) {
                    var paginationText = paginationRow.textContent || paginationRow.innerText;
                    var match = paginationText.match(/(\\d+)\\s*of\\s*(\\d+)/i);
                    if (match) {
                        totalPages = parseInt(match[2]);
                        return {totalPages: totalPages, method: 'gridview'};
                    }
                }
            }
            
            return {totalPages: totalPages, method: 'default'};
        """)
        
        total_pages = pagination_info.get('totalPages', 1) if pagination_info else 1
        
        if total_pages > 1:
            print(f"          Found {total_pages} pages of villages")
        
        # Extract villages from all pages
        for page_num in range(1, total_pages + 1):
            if page_num > 1:
                # Navigate to specific page using multiple methods
                page_clicked = driver.execute_script(f"""
                    var clicked = false;
                    var targetPage = {page_num};
                    
                    // Method 1: Find link with exact page number text
                    var allLinks = document.querySelectorAll('a');
                    for (var i = 0; i < allLinks.length; i++) {{
                        var link = allLinks[i];
                        var text = link.textContent.trim();
                        if (text === targetPage.toString() || text === 'Page ' + targetPage) {{
                            link.click();
                            clicked = true;
                            break;
                        }}
                    }}
                    
                    // Method 2: Find __doPostBack link with Page$X
                    if (!clicked) {{
                        var postBackLinks = document.querySelectorAll('a[href*="__doPostBack"]');
                        for (var j = 0; j < postBackLinks.length; j++) {{
                            var href = postBackLinks[j].getAttribute('href') || '';
                            if (href.indexOf('Page$' + targetPage) !== -1 || 
                                href.indexOf('Page\\\\$' + targetPage) !== -1 ||
                                href.indexOf('Page' + targetPage) !== -1) {{
                                postBackLinks[j].click();
                                clicked = true;
                                break;
                            }}
                        }}
                    }}
                    
                    // Method 3: Use "Next" button if on previous page
                    if (!clicked && targetPage > 1) {{
                        var nextLinks = document.querySelectorAll('a');
                        for (var k = 0; k < nextLinks.length; k++) {{
                            var text = nextLinks[k].textContent.trim().toLowerCase();
                            if (text === 'next' || text === '>' || text.indexOf('next') !== -1) {{
                                nextLinks[k].click();
                                clicked = true;
                                break;
                            }}
                        }}
                    }}
                    
                    return clicked;
                """)
                
                if page_clicked:
                    time.sleep(0.5)  # Ultra-fast wait for page load
                else:
                    print(f"            Warning: Could not navigate to page {page_num}")
                    # Try to continue anyway - might be on correct page
            
            # Extract villages from current page
            villages_js = driver.execute_script("""
                var villages = [];
                var tables = document.getElementsByTagName('table');
                for (var i = 0; i < tables.length; i++) {
                    var table = tables[i];
                    var rows = table.getElementsByTagName('tr');
                    if (rows.length > 1) {
                        // Find village column index from header
                        var headerRow = rows[0];
                        var headers = [];
                        var headerCells = headerRow.getElementsByTagName('th');
                        if (headerCells.length === 0) {
                            headerCells = headerRow.getElementsByTagName('td');
                        }
                        for (var h = 0; h < headerCells.length; h++) {
                            headers.push(headerCells[h].textContent.trim().toLowerCase());
                        }
                        
                        var villageColIdx = -1;
                        for (var idx = 0; idx < headers.length; idx++) {
                            if (headers[idx].indexOf('village') !== -1 || headers[idx].indexOf('vlg') !== -1) {
                                villageColIdx = idx;
                                break;
                            }
                        }
                        if (villageColIdx === -1 && headers.length >= 4) {
                            villageColIdx = 3; // Default to 4th column
                        }
                        
                        // Extract villages from data rows (skip header)
                        for (var r = 1; r < rows.length; r++) {
                            var cells = rows[r].getElementsByTagName('td');
                            // Skip pagination rows (usually have fewer cells or contain "Page")
                            var rowText = rows[r].textContent || rows[r].innerText;
                            if (rowText.indexOf('Page') !== -1) continue;
                            
                            if (villageColIdx >= 0 && cells.length > villageColIdx) {
                                var village = cells[villageColIdx].textContent.trim();
                                if (village && villages.indexOf(village) === -1) {
                                    villages.push(village);
                                }
                            } else if (cells.length >= 4) {
                                var village = cells[3].textContent.trim();
                                if (village && villages.indexOf(village) === -1) {
                                    villages.push(village);
                                }
                            }
                        }
                        if (villages.length > 0) break;
                    }
                }
                return villages;
            """)
            
            page_villages = villages_js if villages_js else []
            all_villages.extend(page_villages)
            
            if page_num > 1:
                print(f"            Page {page_num}: Found {len(page_villages)} villages")
        
        # Remove duplicates
        unique_villages = list(dict.fromkeys(all_villages))  # Preserves order
        
    except Exception as e:
        print(f"      Warning: Could not extract villages: {e}")
        import traceback
        traceback.print_exc()
    
    return unique_villages

def extract_all_data():
    """Main extraction function"""
    driver = setup_driver()
    
    try:
        print("Loading website...")
        driver.get("https://landrecords.karnataka.gov.in/service3/")
        time.sleep(0.5)  # Ultra-fast initial load
        
        # Get all districts using fast JavaScript
        districts = driver.execute_script("""
            var select = document.querySelector('select[name="ddl_district"]');
            var options = [];
            for (var i = 0; i < select.options.length; i++) {
                var opt = select.options[i];
                var val = opt.value;
                if (val !== '0' && val !== 'All') {
                    options.push({value: val, label: opt.text.trim()});
                }
            }
            return options;
        """)
        
        print(f"Found {len(districts)} districts\n")
        start_time = datetime.now()
        
        all_data = []
        
        for i, district in enumerate(districts, 1):
            elapsed = (datetime.now() - start_time).total_seconds()
            print(f"[{i}/{len(districts)}] Processing district: {district['label']} ({district['value']}) - ⏱️ {elapsed:.1f}s")
            
            # Select district using fast JavaScript
            driver.execute_script(f"""
                var select = document.querySelector('select[name="ddl_district"]');
                select.value = '{district['value']}';
                select.dispatchEvent(new Event('change', {{ bubbles: true }}));
            """)
            time.sleep(0.5)  # Ultra-fast wait time
            
            # Get all taluks using JavaScript (faster)
            taluks = driver.execute_script("""
                var select = document.querySelector('select[name="ddl_taluk"]');
                var options = [];
                for (var i = 0; i < select.options.length; i++) {
                    var opt = select.options[i];
                    var val = opt.value;
                    if (val !== '0' && val !== 'All' && val !== '--Select--') {
                        options.push({value: val, label: opt.text.trim()});
                    }
                }
                return options;
            """)
            
            print(f"  Found {len(taluks)} taluks")
            
            district_data = {
                "value": district['value'],
                "label": district['label'],
                "taluks": []
            }
            
            for j, taluk in enumerate(taluks, 1):
                print(f"    [{j}/{len(taluks)}] Processing taluk: {taluk['label']}")
                
                # Select taluk using fast JavaScript
                driver.execute_script(f"""
                    var select = document.querySelector('select[name="ddl_taluk"]');
                    select.value = '{taluk['value']}';
                    select.dispatchEvent(new Event('change', {{ bubbles: true }}));
                """)
                time.sleep(0.5)  # Ultra-fast wait time
                
                # Get all hoblis using JavaScript (faster)
                hoblis = driver.execute_script("""
                    var select = document.querySelector('select[name="ddl_hobli"]');
                    var options = [];
                    for (var i = 0; i < select.options.length; i++) {
                        var opt = select.options[i];
                        var val = opt.value;
                        if (val !== '0' && val !== 'All' && val !== '--Select--') {
                            options.push({value: val, label: opt.text.trim()});
                        }
                    }
                    return options;
                """)
                
                print(f"      Found {len(hoblis)} hoblis")
                
                taluk_data = {
                    "value": taluk['value'],
                    "label": taluk['label'],
                    "hoblis": []
                }
                
                for k, hobli in enumerate(hoblis, 1):
                    print(f"        [{k}/{len(hoblis)}] Processing hobli: {hobli['label']}")
                    
                    # Select hobli using fast JavaScript
                    driver.execute_script(f"""
                        var select = document.querySelector('select[name="ddl_hobli"]');
                        select.value = '{hobli['value']}';
                        select.dispatchEvent(new Event('change', {{ bubbles: true }}));
                    """)
                    time.sleep(0.5)  # Ultra-fast wait time - table loads quickly
                    
                    # Get villages from table (handles pagination automatically)
                    villages = get_villages_from_table(driver)
                    if len(villages) > 0:
                        print(f"          Found {len(villages)} total villages (across all pages)")
                    
                    taluk_data["hoblis"].append({
                        "value": hobli['value'],
                        "label": hobli['label'],
                        "villages": [{"value": str(idx+1), "label": v} for idx, v in enumerate(villages)]
                    })
                    
                    time.sleep(0.1)  # Ultra-minimal delay
                
                district_data["taluks"].append(taluk_data)
                print(f"    Completed taluk: {taluk['label']}\n")
            
            all_data.append(district_data)
            print(f"  Completed district: {district['label']}\n")
            
            time.sleep(0.2)  # Ultra-minimal delay between districts
        
        return all_data
        
    finally:
        driver.quit()

if __name__ == "__main__":
    print("=" * 60)
    print("Karnataka Land Records Data Extraction")
    print("=" * 60)
    print()
    
    try:
        data = extract_all_data()
        
        # Save to JSON file
        output_file = "complete-karnataka-data.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print("\n" + "=" * 60)
        print("Extraction Complete!")
        print("=" * 60)
        print(f"Total districts: {len(data)}")
        total_taluks = sum(len(d["taluks"]) for d in data)
        total_hoblis = sum(len(t["hoblis"]) for d in data for t in d["taluks"])
        total_villages = sum(len(h["villages"]) for d in data for t in d["taluks"] for h in t["hoblis"])
        print(f"Total taluks: {total_taluks}")
        print(f"Total hoblis: {total_hoblis}")
        print(f"Total villages: {total_villages}")
        print(f"\nData saved to: {output_file}")
        
    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()

