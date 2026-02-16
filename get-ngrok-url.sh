#!/bin/bash
# Helper script to get ngrok URL and update API_BASE

echo "🔍 Checking for ngrok tunnel..."

# Try to get URL from ngrok API
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    tunnels = data.get('tunnels', [])
    if tunnels:
        for tunnel in tunnels:
            if tunnel.get('proto') == 'https':
                print(tunnel['public_url'])
                break
except:
    pass
" 2>/dev/null)

if [ -z "$NGROK_URL" ]; then
    echo "❌ Ngrok not running or URL not found"
    echo ""
    echo "Please:"
    echo "1. Open a new terminal"
    echo "2. Run: ngrok http 3000"
    echo "3. Copy the HTTPS URL"
    echo "4. Run this script again with the URL:"
    echo "   ./get-ngrok-url.sh https://your-url.ngrok-free.app"
    exit 1
fi

echo "✅ Found ngrok URL: $NGROK_URL"
echo ""
echo "Updating src/api/geodocsApi.js..."

# Update the API_BASE URL
sed -i '' "s|export const API_BASE = 'https://.*';|export const API_BASE = '$NGROK_URL';|" src/api/geodocsApi.js

echo "✅ Updated API_BASE to: $NGROK_URL"
echo ""
echo "You can now test the app in Expo Go!"

