#!/bin/bash
echo "=== UPDATING TO ASCENT XR COLORS ==="
echo ""

# Ascent XR colors from ascentxr.com
ASCENT_DARK_BLUE="#0a1d45"
ASCENT_LIGHT_BLUE="#132e5e"
ASCENT_ORANGE="#ff6b00"
ASCENT_LIGHT_GRAY="#f5f7fa"

# Files to update (starting with unified dashboard)
FILES="unified_dashboard.html"

for file in $FILES; do
    echo "--- Updating: $file ---"
    
    # Backup
    cp "/home/jim/openclaw/$file" "/home/jim/openclaw/$file.backup2"
    
    # Update CSS color variables
    sed -i "s/--primary: #0052cc;/--primary: $ASCENT_DARK_BLUE;/" "/home/jim/openclaw/$file"
    sed -i "s/--primary-dark: #1d4ed8;/--primary-dark: #071732;/" "/home/jim/openclaw/$file"
    sed -i "s/--secondary: #007bff;/--secondary: $ASCENT_LIGHT_BLUE;/" "/home/jim/openclaw/$file"
    sed -i "s/--success: #DC1625;/--success: $ASCENT_ORANGE;/" "/home/jim/openclaw/$file"
    
    # Update gradient
    sed -i "s/--gradient-primary: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%);/--gradient-primary: linear-gradient(135deg, #071732 0%, $ASCENT_DARK_BLUE 100%);/" "/home/jim/openclaw/$file"
    
    # Update any inline colors
    sed -i "s/#0052cc/$ASCENT_DARK_BLUE/g" "/home/jim/openclaw/$file"
    sed -i "s/#007bff/$ASCENT_LIGHT_BLUE/g" "/home/jim/openclaw/$file"
    sed -i "s/#DC1625/$ASCENT_ORANGE/g" "/home/jim/openclaw/$file"
    
    # Update branding text (ensure Ascent XR not Learning Time VR for dashboard)
    sed -i "s/Learning Time VR - UNIFIED DASHBOARD/Ascent XR - UNIFIED DASHBOARD/" "/home/jim/openclaw/$file"
    sed -i "s/Learning Time VR Principles/Ascent XR Principles/" "/home/jim/openclaw/$file"
    
    echo "  ✓ Colors updated to Ascent XR palette"
done

echo ""
echo "=== TESTING ==="
echo "Checking unified dashboard colors:"
grep -n "primary\|secondary\|success" /home/jim/openclaw/unified_dashboard.html | head -10

echo ""
echo "✅ Color update complete!"