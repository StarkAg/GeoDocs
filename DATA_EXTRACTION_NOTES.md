# Data Extraction Notes

## Current Status

The website (https://landrecords.karnataka.gov.in/service3/) uses ASP.NET with cascading dropdowns that require:
1. Proper session handling (cookies)
2. ViewState management
3. JavaScript execution for dynamic loading

## District Values from Website

The website uses these district values (different from current file):
- 2 = Bagalkote (currently 1)
- 21 = Bangalore Rural (currently 2)
- 20 = BANGALORE URBAN (currently 3)
- 1 = Belgaum (currently 4)
- 12 = BELLARY (currently 5)
- 5 = Bidar (currently 6)
- 3 = Bijapur (currently 7)
- 27 = Chamarajanagara (currently 8)
- 28 = Chikkaballapur (currently 9)
- 17 = Chikmagalur (currently 10)
- 13 = chitradurga (currently 11)
- 24 = Dakshina Kannada (currently 12)
- 14 = Davanagere (currently 13)
- 9 = DHARWAD (currently 14)
- 8 = Gadag (currently 15)
- 4 = Gulbarga (currently 16)
- 23 = Hassan (currently 17)
- 11 = Haveri (currently 18)
- 25 = Kodagu (currently 19)
- 19 = KOLAR (currently 20)
- 7 = koppal (currently 21)
- 22 = mandya (currently 22)
- 26 = Mysore (currently 23)
- 6 = Raichur (currently 24)
- 29 = Ramanagara (currently 25)
- 15 = Shimoga (currently 26)
- 18 = Tumkur (currently 27)
- 16 = UDUPI (currently 28)
- 10 = Uttar Kannada (currently 29)
- 30 = Yadagir (currently 31)

## Issues

1. **Hoblis**: Cannot be extracted programmatically easily - they load dynamically via JavaScript when taluk is selected
2. **Villages**: Are text input fields, not dropdowns - cannot get complete list
3. **Taluks**: Can be extracted but need proper ASP.NET form submission

## Recommendation

1. Update district values to match website
2. For hoblis: Use WebView in app to dynamically load them when user selects taluk
3. For villages: Keep as text input or create a searchable dropdown with common village names

