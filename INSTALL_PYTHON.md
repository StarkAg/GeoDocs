# Python Script Installation Instructions

## Step 1: Install Python Dependencies

Run this command in your terminal:

```bash
cd "/Users/mrstark/Desktop/Code PlayGround/GeoDocs"
pip3 install --break-system-packages selenium webdriver-manager
```

Or if that doesn't work:

```bash
pip3 install --user selenium webdriver-manager
```

## Step 2: Run the Script

```bash
python3 extract_data.py
```

## What the Script Does

1. Opens Chrome browser
2. Goes to the Karnataka Land Records website
3. For each district:
   - Selects the district
   - Gets all taluks
   - For each taluk:
     - Selects the taluk
     - Gets all hoblis
     - For each hobli:
       - Selects the hobli
       - Extracts village names from the table that appears
4. Saves all data to `complete-karnataka-data.json`

## Expected Output

The script will:
- Show progress for each district, taluk, and hobli
- Extract village names from the table
- Save complete data to JSON file
- Take approximately 30-60 minutes to complete (depending on number of districts/taluks/hoblis)

## Troubleshooting

If you get ChromeDriver errors:
- The script uses `webdriver-manager` which should auto-download ChromeDriver
- Make sure Chrome browser is installed
- If issues persist, manually install ChromeDriver from: https://chromedriver.chromium.org/

