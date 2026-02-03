#!/bin/bash
echo "=== FIXING ABSOLUTE PATHS IN HTML FILES ==="

FILES="ascent_dashboard_docs.html ASCENT_XR_DASHBOARD.html ASCENT_XR_LINKEDIN_STRATEGY.html ASCENT_XR_ROI_TEMPLATE.html ASCENT_ASSISTANT_CONSTITUTION.html NICK_STATUS.html LINKEDIN_SCHEDULE.html unified_dashboard.html"

for file in $FILES; do
    echo "Processing: $file"
    
    # Count absolute paths before
    before=$(grep -c 'href="/dev/' "$file" 2>/dev/null || echo "0")
    
    # Fix absolute paths
    sed -i 's|href="/dev/\([^"]*\)"|href="\1"|g' "$file"
    
    # Count after
    after=$(grep -c 'href="/dev/' "$file" 2>/dev/null || echo "0")
    
    echo "  Fixed: $before → $after absolute paths"
done

echo "=== VERIFICATION ==="
for file in $FILES; do
    echo "--- $file ---"
    grep -o 'href="[^"]*\.html"' "$file" | sort | uniq | head -5
done
