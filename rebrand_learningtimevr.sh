#!/bin/bash
echo "=== REBRANDING TO LEARNING TIME VR ==="
echo ""

# Define brand colors from learningtimevr.com
PRIMARY_BLUE="#0052cc"
PRIMARY_BLUE_DARK="#0041a3"
ACCENT_RED="#DC1625"
ACCENT_RED_DARK="#be1320"
SECONDARY_BLUE="#007bff"
BACKGROUND_DARK="#0f172a"
CARD_DARK="#1e293b"
TEXT_PRIMARY="#f8fafc"
TEXT_SECONDARY="#94a3b8"

# Files to rebrand
FILES="unified_dashboard.html ascent_dashboard_docs.html ASCENT_XR_DASHBOARD.html ASCENT_XR_LINKEDIN_STRATEGY.html ASCENT_XR_ROI_TEMPLATE.html ASCENT_ASSISTANT_CONSTITUTION.html NICK_STATUS.html LINKEDIN_SCHEDULE.html linkedin_gallery.html"

# Upload favicon first
echo "Uploading Learning Time VR favicon..."
curl -T /home/jim/openclaw/branding/learningtimevr/favicon.png "ftp://${FTP_USER}:${FTP_PASS}@${FTP_HOST}/dev/favicon.png" >/dev/null 2>&1
echo "  ✓ Favicon uploaded"

for file in $FILES; do
    echo "--- Processing: $file ---"
    
    # Create backup
    cp "/home/jim/openclaw/$file" "/home/jim/openclaw/$file.backup"
    
    # 1. Replace Ascent XR with Learning Time VR in titles and text
    sed -i 's/Ascent XR/Learning Time VR/g' "/home/jim/openclaw/$file"
    sed -i 's/ASCENT XR/Learning Time VR/g' "/home/jim/openclaw/$file"
    sed -i 's/Ascent Constitution/Learning Time VR Principles/g' "/home/jim/openclaw/$file"
    
    # 2. Update CSS color variables
    sed -i "s/#3b82f6/$PRIMARY_BLUE/g" "/home/jim/openclaw/$file"
    sed -i "s/#0ea5e9/$SECONDARY_BLUE/g" "/home/jim/openclaw/$file"
    sed -i "s/#10b981/$ACCENT_RED/g" "/home/jim/openclaw/$file"  # Success → Red accent
    
    # 3. Add favicon link if not present
    if ! grep -q "favicon" "/home/jim/openclaw/$file"; then
        sed -i 's|<head>|<head>\n    <link rel="icon" type="image/png" href="favicon.png">|' "/home/jim/openclaw/$file"
    fi
    
    # 4. Update document titles
    if [[ "$file" == "ASCENT_XR_DASHBOARD.html" ]]; then
        sed -i 's|<title>.*</title>|<title>Learning Time VR Dashboard</title>|' "/home/jim/openclaw/$file"
    elif [[ "$file" == "ASCENT_XR_LINKEDIN_STRATEGY.html" ]]; then
        sed -i 's|<title>.*</title>|<title>Learning Time VR LinkedIn Strategy</title>|' "/home/jim/openclaw/$file"
    elif [[ "$file" == "ASCENT_ASSISTANT_CONSTITUTION.html" ]]; then
        sed -i 's|<title>.*</title>|<title>Learning Time VR Principles</title>|' "/home/jim/openclaw/$file"
    fi
    
    # 5. Update LinkedIn specific branding
    if [[ "$file" == *"LINKEDIN"* ]]; then
        sed -i 's/Ascent XR LinkedIn/Learning Time VR LinkedIn/g' "/home/jim/openclaw/$file"
    fi
    
    echo "  ✓ Rebranded"
done

echo ""
echo "=== UPLOADING REBRANDED FILES ==="
for file in $FILES; do
    echo "Uploading: $file"
    curl -T "/home/jim/openclaw/$file" "ftp://${FTP_USER}:${FTP_PASS}@${FTP_HOST}/dev/$file" >/dev/null 2>&1
    echo "  ✓ Uploaded"
done

echo ""
echo "=== VERIFICATION ==="
echo "Testing unified dashboard:"
curl -s "https://ascentxr.com/dev/unified_dashboard.html" | grep -i "learning time" | head -3
echo ""
echo "✅ Rebranding complete!"
